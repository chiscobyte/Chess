document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const moviePoster = document.getElementById("movie-poster");
    const movieTitle = document.getElementById("movie-title");
    const movieDescription = document.getElementById("movie-description");
    const movieRuntime = document.getElementById("movie-runtime");
    const movieShowtime = document.getElementById("movie-showtime");
    const availableTickets = document.getElementById("available-tickets");
    const buyTicketBtn = document.getElementById("buy-ticket-btn");
    const filmList = document.getElementById("films");
  
    let currentMovie; // Keep track of the currently selected movie
  
    // Fetching and display all movies
    fetch("http://localhost:3000/films")
      .then((response) => response.json())
      .then((movies) => {
        filmList.innerHTML = ""; // Clear any placeholder content
        movies.forEach((movie) => {
          // Creating a list item for each movie
          const filmItem = document.createElement("li");
          filmItem.textContent = movie.title;
          filmItem.classList.add("film");
  
          // delete button for each movie
          const deleteBtn = document.createElement("button");
          deleteBtn.textContent = "Delete";
          deleteBtn.classList.add("delete-btn");
  
          // click event to delete the movie
          deleteBtn.addEventListener("click", () => deleteMovie(movie, filmItem));
  
          filmItem.appendChild(deleteBtn);
  
          // a click event to display movie details when clicked
          filmItem.addEventListener("click", () => displayMovieDetails(movie));
  
          // adding the film item to the list
          filmList.appendChild(filmItem);
        });
  
        // Automatically display the first movie in the list
        if (movies.length > 0) {
          displayMovieDetails(movies[0]);
        }
      })
      .catch((error) => console.error("Error fetching films:", error));
  
    // movie details
    function displayMovieDetails(movie) {
      currentMovie = movie;
      moviePoster.src = movie.poster;
      movieTitle.textContent = movie.title;
      movieDescription.textContent = `Description: ${movie.description}`;
      movieRuntime.textContent = `Runtime: ${movie.runtime} minutes`;
      movieShowtime.textContent = `Showtime: ${movie.showtime}`;
      availableTickets.textContent = `Available Tickets: ${
        movie.capacity - movie.tickets_sold
      }`;
  
      // Enabling/disabling the buy ticket button
      if (movie.capacity - movie.tickets_sold > 0) {
        buyTicketBtn.disabled = false;
        buyTicketBtn.textContent = "Buy Ticket";
      } else {
        buyTicketBtn.disabled = true;
        buyTicketBtn.textContent = "Sold Out";
      }
    }
  
    // handling buying tickets
    buyTicketBtn.addEventListener("click", () => {
      if (currentMovie.capacity - currentMovie.tickets_sold > 0) {
        currentMovie.tickets_sold++;
        availableTickets.textContent = `Available Tickets: ${
          currentMovie.capacity - currentMovie.tickets_sold
        }`;
  
        // Updating sold-out state if needed
        if (currentMovie.capacity - currentMovie.tickets_sold === 0) {
          buyTicketBtn.disabled = true;
          buyTicketBtn.textContent = "Sold Out";
  
          // Update the menu item for the movie to indicate it's sold out
          const filmItems = document.querySelectorAll(".film");
          filmItems.forEach((filmItem) => {
            if (filmItem.textContent.includes(currentMovie.title)) {
              filmItem.classList.add("sold-out");
              filmItem.textContent = `${currentMovie.title} (Sold Out)`;
            }
          });
        }
  
        // persist the updated tickets_sold on the server
        fetch(`http://localhost:3000/films/${currentMovie.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tickets_sold: currentMovie.tickets_sold,
          }),
        }).catch((error) => console.error("Error updating tickets:", error));
      }
    });
  
    // delete a movie from the menu and server
    function deleteMovie(movie, filmItem) {
      // remove the movie from the DOM
      filmItem.remove();
  
      // send a DELETE request to the server
      fetch(`http://localhost:3000/films/${movie.id}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (response.ok) {
            console.log(`Movie "${movie.title}" deleted successfully`);
          } else {
            console.error("Error deleting movie:", response.statusText);
          }
        })
        .catch((error) => console.error("Error deleting movie:", error));
    }
  });