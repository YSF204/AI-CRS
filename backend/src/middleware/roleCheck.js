// ================================== //
//    ROLE BASED AUTHORIZATION        //
// ================================== //

export const authorize = (allowedRoles) => {

    // the allowedRoles comes from the Router folder when defining routes , 
    // for eg. : post ('/adminOnlyRoute', authorize(['ADMIN']))
    // in this case only users with role 'ADMIN' can access this route
    // if some other role user tries to access this route , they will get 403 Access Denied

    return (req, res, next) => {

        try {
            // Check if user exists 
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            // Check if the user role is in the allowed roles
            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied.'
                });
            }

            // User has required role, proceed
            next();

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Authorization failed',
                error: error.message
            });
        }
    };
};

// these just to make it easier to use in routes 
// instead of writing authorize(['EMPLOYEE']) every time , we can just write isEmployee
// after requireing this file

export const isEmployee = authorize(['EMPLOYEE']);
export const isEmployer = authorize(['EMPLOYER']);
export const isAdmin = authorize(['ADMIN']);