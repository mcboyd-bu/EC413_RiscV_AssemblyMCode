var appRouter = function (app) {

  app.get("/", function(req, res) {
    res.status(200).send("Welcome to our restful API");
  });

  // app.post('/', function(req, res) {
  // 	console.log(req.body.data.toString());
  // 	res.status(200).send();
  // });

	app.post('/api/data', (request, response) => {
		const postBody = request.body;
		console.log(postBody);
	});

}



module.exports = appRouter;