module.exports = fnc=> (req,res,next) => {
    return Promise.resolve(fnc(req,res,next)).catch(next)
}