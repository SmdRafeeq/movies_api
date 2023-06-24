const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const dbConnection = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server started at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`Database error is ${error.message}`);
    process.exit(1);
  }
};

dbConnection();

const convertMovieName = (obj) => {
  return {
    movieName: obj.movie_name,
  };
};

// 1 GET MOVIES NAMES API

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `select * from movie;`;

  const moviesArray = await db.all(getMoviesQuery);
  response.send(moviesArray.map((eachMovie) => convertMovieName(eachMovie)));
});

const convertMoviesObject = (obj) => {
  return {
    movieId: obj.movie_id,
    directorId: obj.director_id,
    movieName: obj.movie_name,
    leadActor: obj.lead_actor,
  };
};

// 2 MOVIE ADDED POST API

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const addMovieQuery = `insert into movie (director_id, movie_name, lead_actor)
        values (${directorId},"${movieName}","${leadActor}");`;

  await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

// 3 GET API

app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const movieQuery = `select * from movie where movie_id = ${movieId}`;

  const moviesQuery = await db.get(movieQuery);

  response.send(convertMoviesObject(moviesQuery));
});

// 4 PUT UPDATE MOVIE API

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;

  const updateMovieQuery = `update movie set 
        director_id = ${directorId},
        movie_name = "${movieName}",
        lead_actor = "${leadActor}" where movie_id = ${movieId};
        `;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

// 5 DELETE API

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `delete from movie where movie_id = ${movieId};`;

  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

// DIRECTORS OBJECT

const directorObject = (obj) => {
  return {
    directorId: obj.director_id,
    directorName: obj.director_name,
  };
};

// 6 GET DIRECTORS API

app.get("/directors/", async (request, response) => {
  const directorsQuery = `select * from director;`;

  const directorsArray = await db.all(directorsQuery);
  response.send(directorsArray.map((each) => directorObject(each)));
});

// 7 MOVIE NAME AND DIRECTORS API

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;

  const getQuery = `select movie_name from director INNER JOIN movie
        ON movie.director_id = director.director_id where
        director.director_id = ${directorId};`;

  const result = await db.all(getQuery);
  //console.log(directorId)
  response.send(result.map((each) => convertMovieName(each)));
});

module.exports = app;
