from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_mail import Mail, Message
import os
import random
import string
import datetime
import bcrypt
import jwt
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})


app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://postgres:your_password@localhost/database_name')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', ''.join(random.choice(string.ascii_letters + string.digits) for _ in range(32)))

# Configure email
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True') == 'True'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
mail = Mail(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    is_verified = db.Column(db.Boolean, default=False)
    
    def __repr__(self):
        return f"User('{self.username}', '{self.email}')"

class OTP(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False)
    otp_code = db.Column(db.String(4), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    expires_at = db.Column(db.DateTime)
    
    def __init__(self, email, otp_code):
        self.email = email
        self.otp_code = otp_code
        self.expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
    
    def is_expired(self):
        return datetime.datetime.utcnow() > self.expires_at
    
    def __repr__(self):
        return f"OTP('{self.email}', '{self.otp_code}')"

# Helper functions
def generate_otp():
    return ''.join(random.choices(string.digits, k=4))

def send_otp_email(email, otp):
    try:
        msg = Message('Your OTP for Registration', recipients=[email])
        msg.body = f'Your OTP for registration is: {otp}\nThis code will expire in 10 minutes.'
        msg.html = f'''
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #333;">Verification Code</h2>
            <p>Use the following OTP to complete your registration:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
                {otp}
            </div>
            <p style="margin-top: 20px; font-size: 14px; color: #777;">This code will expire in 10 minutes.</p>
        </div>
        '''
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

# Routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')

    # Check if user already exists
    existing_user = User.query.filter((User.email == email) | (User.username == username)).first()
    if existing_user:
        field = "email" if existing_user.email == email else "username"
        return jsonify({"success": False, "message": f"This {field} is already registered."}), 400

    # Generate OTP
    otp_code = generate_otp()

    # Delete any existing OTP for this email
    OTP.query.filter_by(email=email).delete()
    temp_user_data = {
        "email": email,
        "username": username,
        "password": password  # Keep it temporarily in JWT for verification
    }

    # Store user information immediately as an unverified user
    new_user = User(email=email, username=username, password=password, is_verified=False)
    db.session.add(new_user)
    db.session.commit()  # Commit the user to generate the ID

    # Store OTP record in the database
    new_otp = OTP(email=email, otp_code=otp_code)  # Link OTP to user
    db.session.add(new_otp)
    db.session.commit()

    # Generate a JWT token for temporary session storage
    token = jwt.encode(
        {
            "user_data": temp_user_data,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
        },
        app.config['SECRET_KEY'],
        algorithm="HS256"
    )

    # Send OTP email
    email_sent = send_otp_email(email, otp_code)

    if email_sent:
        return jsonify({
            "success": True,
            "message": "OTP has been sent to your email!",
            "token": token
        }), 200
    else:
        # If OTP email fails, delete the unverified user to prevent orphan records
        db.session.delete(new_user)
        db.session.commit()
        return jsonify({"success": False, "message": "Failed to send OTP. Please try again."}), 500

@app.route('/api/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    token = data.get('token')
    otp_code = data.get('otp')
    
    try:
        # Decode token to get user data
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        temp_user_data = payload.get("user_data")
        
        if not temp_user_data:
            return jsonify({"success": False, "message": "Invalid token"}), 400
        
        email = temp_user_data.get("email")
        
        # Verify OTP
        otp_record = OTP.query.filter_by(email=email, otp_code=otp_code).first()
        
        if not otp_record:
            return jsonify({"success": False, "message": "Invalid OTP"}), 400
        
        if otp_record.is_expired():
            db.session.delete(otp_record)
            db.session.commit()
            return jsonify({"success": False, "message": "OTP has expired"}), 400
        # Find the existing unverified user
        existing_user = User.query.filter_by(email=email, is_verified=False).first()

        if not existing_user:
            return jsonify({"success": False, "message": "User not found or already verified"}), 400

        # Update user as verified and hash the password
        existing_user.password = bcrypt.hashpw(temp_user_data.get("password").encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        existing_user.is_verified = True

        db.session.commit()

        db.session.delete(otp_record)
        db.session.commit()
        
        return jsonify({"success": True, "message": "Registration successful!"}), 201
    
    except jwt.ExpiredSignatureError:
        return jsonify({"success": False, "message": "Token has expired"}), 400
    except jwt.InvalidTokenError:
        return jsonify({"success": False, "message": "Invalid token"}), 400
    except Exception as e:
        print(f"Error during OTP verification: {e}")
        return jsonify({"success": False, "message": "An error occurred during registration"}), 500

@app.route('/api/resend-otp', methods=['POST'])
def resend_otp():
    data = request.get_json()
    token = data.get('token')
    
    try:
        # Decode token to get user data
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        temp_user_data = payload.get("user_data")
        
        if not temp_user_data:
            return jsonify({"success": False, "message": "Invalid token"}), 400
        
        email = temp_user_data.get("email")
        
        # Generate new OTP
        otp_code = generate_otp()
        
        # Delete any existing OTP for this email
        OTP.query.filter_by(email=email).delete()
        
        # Create new OTP record
        new_otp = OTP(email=email, otp_code=otp_code)
        
        db.session.add(new_otp)
        db.session.commit()
        
        # Send OTP email
        email_sent = send_otp_email(email, otp_code)
        
        if email_sent:
            # Generate new token with extended expiry
            new_token = jwt.encode(
                {
                    "user_data": temp_user_data,
                    "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
                },
                app.config['SECRET_KEY'],
                algorithm="HS256"
            )
            
            return jsonify({
                "success": True, 
                "message": "OTP has been resent to your email!",
                "token": new_token
            }), 200
        else:
            return jsonify({"success": False, "message": "Failed to send OTP. Please try again."}), 500
    
    except jwt.ExpiredSignatureError:
        return jsonify({"success": False, "message": "Session expired. Please start registration again"}), 400
    except jwt.InvalidTokenError:
        return jsonify({"success": False, "message": "Invalid session. Please start registration again"}), 400
    except Exception as e:
        print(f"Error during OTP resend: {e}")
        return jsonify({"success": False, "message": "An error occurred while resending OTP"}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"success": False, "message": "Endpoint not found"}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({"success": False, "message": "Internal server error"}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
