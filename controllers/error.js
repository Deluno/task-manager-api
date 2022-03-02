exports.badRequest = (req, res, next) => {
	res.status(400).send();
};

exports.methodNotAllowed = (req, res, next) => {
	res.status(405).send();
};
