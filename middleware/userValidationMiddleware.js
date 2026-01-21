const validateFormat = (req, res, next) => {
    const { email } = req.body;
    const { password } = req.body;
 
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/;
 
    if (!email || !password) {
        return res.status(400).json({
            message: "Email and Password are required"
        });
    }
 
    if (!emailRegex.test(email) || !passwordRegex.test(password)) {
        return res.status(400).json({
            message: "Invalid Email and Password format"
        });
    }
 
    next();
};
export default validateFormat;
 
 