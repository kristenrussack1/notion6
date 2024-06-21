const express = require("express");
const moduleToFetch  = require("./index");
const getDatabase = moduleToFetch.getDatabase;
const fetchProjects = moduleToFetch.fetchProjects;


const port = 8009;
const app = express();





app.use(express.static("public"));
;



app.get("/users", async (req, res) => {
    const users = await getDatabase();
    res.json(users);
  });

  app.get("/users", async (req, res) => {
      const users = await fetchProjects();
      res.json(users);
  });



app.listen(port, console.log(`Server started on ${port}`));

