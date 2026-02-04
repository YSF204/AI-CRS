import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ================================== //
//            Gen JWT TOKEN           //
// ================================== //

const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// ================================== //
//       REGISTER NEW USER            //
// ================================== //

export const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, gender, role, telephone, age } = req.body;

        // make sure that all the fields are provided
        if (!firstName || !lastName || !email || !password || !gender || !role || !age) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // validate the role : 
        const validRoles = ['EMPLOYEE', 'EMPLOYER', 'ADMIN'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Role must be one of EMPLOYEE, EMPLOYER, ADMIN'
            })
        }

        // check if the user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // if no issues , create the user

        // but before creating the user , we need to determine the account status based on the role 
        // if the role is EMPLOYEE , then the account status will be ACTIVE
        // if the role is EMPLOYER , then the account status will be PENDING ( waiting for admin approval )

        const accountStatus = role === 'EMPLOYER' ? 'PENDING' : 'ACTIVE';

        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            gender,
            role,
            telephone: telephone || [],
            age,
            accountStatus // it will be based on the role
        });

        // Gen token for the user
        const token = generateToken(user._id);

        // now we return the user data without the password 

         const userResponse = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            gender: user.gender,
            age: user.age,
            telephone: user.telephone,
            accountStatus: user.accountStatus
        };

        res.status(201).json({
            success: true,
            message : 'User registered successfully',
            data: {
                user: userResponse,
                token: token
            }
        });
        
    } catch (error) {
        console.log('Error in user registration:', error);
        res.status(500).json({
            success: false,
            message : 'Reg has failed',
            error: error.message
        })

    }

};

// ================================== //
//            LOGIN USER              //
// ======================.============ //
export const login = async (req , res)=>{

    try {   
        const { email , password } = req.body;

        // make sure that all the fields are provided

        if (!email || !password){
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // find the user by the email
        const user = await User.findOne({email : email.toLowerCase()});

        if(!user){
            return res.status(400).json({
                success: false,
                message: 'Invalid email or password'
            });
            
        }

        // check if the Account is ACTIVE or not

        if(user.accountStatus !== 'ACTIVE'){
            return res.status(403).json({
                success: false,
                message: `Account is not active. Current status: ${user.accountStatus}`
            });
        };

        const isPasswordValid = await user.comparePassword(password);
        
        if(!isPasswordValid){
            return res.status(400).json({
                success: false,
                message: 'Invalid email or password'
            });
        };
        // Gen token for the user
        const token = generateToken(user._id);

        // return user
             const userResponse = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            gender: user.gender,
            age: user.age,
            telephone: user.telephone,
            accountStatus: user.accountStatus
        };

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: userResponse,
                token
            }
        });

    } catch (error){
        console.log('Error in user login:', error);
        res.status(500).json({
            success: false,
            message: 'Login has failed',
            error: error.message
        });
    }

}

// ================================== //
//       GET CURRENT LOGGED IN USER   //
// ================================== //   

export const getCurrentUser = async (req , res)=> {
    try {
        const user = await User.findById(req.user._id).select('-password');

        if(!user){
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            data: {
                user
            }
        });

    } catch (error){
        console.log('Error in getting current user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get current user',
            error: error.message
        });
    }

}


// ================================== //
//       LOGOUT USER                  //
// ================================== //

export const logout = async (req , res) =>{

    try {
        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.log('Error in user logout:', error);
        res.status(500).json({
            success: false,
            message: 'Logout has failed',
            error: error.message
        });
    }
};

