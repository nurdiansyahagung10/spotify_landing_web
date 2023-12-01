const APIController = (function() {
    
    const clientId = 'a765c74c00434237bac660d7bfdee98e';
    const clientSecret = 'cc40448c4cec4648a42a3a7979910739';

    // private methods

const _getRecommendations = async (token, limit) => {
    // Ambil semua playlist
    const result = await fetch('https://api.spotify.com/v1/browse/featured-playlists', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await result.json();
    const allPlaylists = data.playlists.items;

    // Acak daftar playlist
    const shuffledPlaylists = shuffleArray(allPlaylists);

    // Ambil sejumlah playlist sesuai dengan limit
    const selectedPlaylists = shuffledPlaylists.slice(0, limit);

    return selectedPlaylists;
}

// Fungsi untuk mengacak (shuffle) array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
const _getPlaylistDetails = async (token, playlistId) => {
    const result = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
    });

    const data = await result.json();
    return data;
}



     const _searchTracks = async (token, searchTerm) => {
        const result = await fetch(`https://api.spotify.com/v1/search?q=${searchTerm}&type=track`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await result.json();
        return data.tracks.items;
    }

    const _getToken = async () => {

        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded', 
                'Authorization' : 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });

        const data = await result.json();
        return data.access_token;
    }
    
    const _getGenres = async (token) => {

        const result = await fetch(`https://api.spotify.com/v1/browse/categories?locale=sv_US`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data.categories.items;
    }

    const _getPlaylistByGenre = async (token, genreId) => {

        const limit = 10;
        
        const result = await fetch(`https://api.spotify.com/v1/browse/categories/${genreId}/playlists?limit=${limit}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data.playlists.items;
    }

    const _getTracks = async (token, tracksEndPoint) => {

        const limit = 10;

        const result = await fetch(`${tracksEndPoint}?limit=${limit}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data.items;
    }

    const _getTrack = async (token, trackEndPoint) => {

        const result = await fetch(`${trackEndPoint}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data;
    }

    return {
        getToken() {
            return _getToken();
        },
        getGenres(token) {
            return _getGenres(token);
        },
        getPlaylistByGenre(token, genreId) {
            return _getPlaylistByGenre(token, genreId);
        },
        getTracks(token, tracksEndPoint) {
            return _getTracks(token, tracksEndPoint);
        },
        getTrack(token, trackEndPoint) {
            return _getTrack(token, trackEndPoint);
        },
         searchTracks(token, searchTerm) {
            return _searchTracks(token, searchTerm);
        },
          getRecommendations(token, seedGenres, limit) {
            return _getRecommendations(token, seedGenres, limit);
        },
             getRecommendations(token, seedGenres, limit) {
        return _getRecommendations(token, seedGenres, limit);
    },
      getPlaylistDetails(token, playlistId) {
        return _getPlaylistDetails(token, playlistId);
    },
    }
})();


// UI Module
const UIController = (function() {

    //object to hold references to html selectors
    const DOMElements = {
        selectGenre: '#select_genre',
        selectPlaylist: '#select_playlist',
        buttonSubmit: '#btn_submit',
        divSongDetail: '#song-detail',
        hfToken: '#hidden_token',
        divSonglist: '.song-list'
    }

    //public methods
    return {

        //method to get input fields
        inputField() {
            return {
                genre: document.querySelector(DOMElements.selectGenre),
                playlist: document.querySelector(DOMElements.selectPlaylist),
                tracks: document.querySelector(DOMElements.divSonglist),
                submit: document.querySelector(DOMElements.buttonSubmit),
                songDetail: document.querySelector(DOMElements.divSongDetail)
            }
        },

        // need methods to create select list option
        createGenre(text, value) {
            const html = `<option value="${value}">${text}</option>`;
            document.querySelector(DOMElements.selectGenre).insertAdjacentHTML('beforeend', html);
        }, 

        createPlaylist(text, value) {
            const html = `<option value="${value}">${text}</option>`;
            document.querySelector(DOMElements.selectPlaylist).insertAdjacentHTML('beforeend', html);
        },

        // need method to create a track list group item 
        createTrack(id, name, previewUrl) {
    const html = `<a href="#" class="list-group-item list-group-item-action list-group-item-light" id="${id}" data-preview="${previewUrl}">${name}</a>`;
    document.querySelector(DOMElements.divSonglist).insertAdjacentHTML('beforeend', html);
},

        // need method to create the song detail
        createTrackDetail(img, title, artist, previewUrl) {

            const detailDiv = document.querySelector(DOMElements.divSongDetail);
            // any time user clicks a new song, we need to clear out the song detail div
            detailDiv.innerHTML = '';

         const html =
        `
        <div class="row col-sm-12 px-0">
            <img src="${img}" alt="">        
        </div>
        <div class="row col-sm-12 px-0">
            <label for="Genre" class="form-label col-sm-12">${title}:</label>
        </div>
        <div class="row col-sm-12 px-0">
            <label for="artist" class="form-label col-sm-12">By ${artist}:</label>
        </div>
        <div class="row col-sm-12 px-0">
            <div class="audio-player">
                <audio controls id="audio-player">
                    <source src="${previewUrl}" type="audio/mp3">
                    Your browser does not support the audio tag.
                </audio>
            </div>
        </div>
    `;


            detailDiv.insertAdjacentHTML('beforeend', html)

              const audioPlayer = document.getElementById('audio-player');
            audioPlayer.src = previewUrl;
        },


        resetTrackDetail() {
            this.inputField().songDetail.innerHTML = '';
        },

        resetTracks() {
            this.inputField().tracks.innerHTML = '';
            this.resetTrackDetail();
        },

        resetPlaylist() {
            this.inputField().playlist.innerHTML = '';
            this.resetTracks();
        },
        
        storeToken(value) {
            document.querySelector(DOMElements.hfToken).value = value;
        },

        getStoredToken() {
            return {
                token: document.querySelector(DOMElements.hfToken).value
            }
        },

                  createSearchResult(id, name, previewUrl) {
            const html = `<a href="#" class="list-group-item list-group-item-action list-group-item-light" id="${id}" data-preview="${previewUrl}">${name}</a>`;
    document.querySelector(DOMElements.divSonglist).insertAdjacentHTML('beforeend', html);
        },


       createSearchResultDetail(img, title, artist, previewUrl) {
            const detailDiv = document.querySelector(DOMElements.divSongDetail);
            // Any time the user clicks a new song, clear out the song detail div
            detailDiv.innerHTML = '';

            const html =
                `
                <div class="row col-sm-12 px-0">
                    <img src="${img}" alt="">        
                </div>
                <div class="row col-sm-12 px-0">
                    <label for="Genre" class="form-label col-sm-12">${title}:</label>
                </div>
                <div class="row col-sm-12 px-0">
                    <label for="artist" class="form-label col-sm-12">By ${artist}:</label>
                </div>
                <div class="row col-sm-12 px-0">
                    <div class="audio-player">
                        <audio controls id="audio-player">
                            <source src="${previewUrl}" type="audio/mp3">
                            Your browser does not support the audio tag.
                        </audio>
                    </div>
                </div>
            `;

            detailDiv.insertAdjacentHTML('beforeend', html);

            // Set the audio source
            const audioPlayer = document.getElementById('audio-player');
            audioPlayer.src = previewUrl;
        },
        
       createPlaylistsongdetail(img, title, artist, previewUrl) {
            const detailDiv = document.querySelector(DOMElements.divSongDetail);
            // Any time the user clicks a new song, clear out the song detail div
            detailDiv.innerHTML = '';

            const html =
                `
                <div class="row col-sm-12 px-0">
                    <img src="${img}" alt="">        
                </div>
                <div class="row col-sm-12 px-0">
                    <label for="Genre" class="form-label col-sm-12">${title}:</label>
                </div>
                <div class="row col-sm-12 px-0">
                    <label for="artist" class="form-label col-sm-12">By ${artist}:</label>
                </div>
                <div class="row col-sm-12 px-0">
                    <div class="audio-player">
                        <audio controls id="audio-player">
                            <source src="${previewUrl}" type="audio/mp3">
                            Your browser does not support the audio tag.
                        </audio>
                    </div>
                </div>
            `;

            detailDiv.insertAdjacentHTML('beforeend', html);

            // Set the audio source
            const audioPlayer = document.getElementById('audio-player');
            audioPlayer.src = previewUrl;
        },
        

        // New method to reset search results
        resetSearchResults() {
            document.getElementById('search-results').innerHTML = '';
        },

        createRecommendationPlaylist(id, name, data) {
    const images = data.images;
    const coverUrl = images.length > 0 ? images[0].url : 'default_cover_url'; // Provide a default cover URL if no images are available

    const html = `
        <div class="list-group-item list-group-item-action recommendation-item" id="${id}" data-cover="${coverUrl}">
            ${name}
        </div>`;
    document.getElementById('recommendations').insertAdjacentHTML('beforeend', html);


    // Add click event listener to the created playlist item
   
},

createRecommendationPlaylistDetail(id,name,previewUrl) {

                const html = `<a href="#" class="list-group-item list-group-item-action list-group-item-light" id="${id}" data-preview="${previewUrl}">${name}</a>`;
    document.querySelector('#search-results').insertAdjacentHTML('beforeend', html);
},

        // New method to create playlist track
        createPlaylistTrack(name) {
            const html = `<li class="list-group-item">${name}</li>`;
            document.querySelector('.playlist-tracks').insertAdjacentHTML('beforeend', html);
        },
        // New method to reset recommendations
        resetRecommendations() {
            document.getElementById('recommendations').innerHTML = '';
            this.resetTracks();
        }
    }

})();

const APPController = (function(UICtrl, APICtrl) {

      const initSearch = () => {
        // ... existing code ...

        // Add event listener for search form submission
        document.getElementById('search-form').addEventListener('submit', async function (e) {
            e.preventDefault();
            const searchTerm = document.getElementById('search').value;
            if (searchTerm.trim() !== '') {
                const token = UICtrl.getStoredToken().token;
                const searchResult = await APICtrl.searchTracks(token, searchTerm);

                // Clear existing search results, tracks, and track details
                UICtrl.resetSearchResults();
                UICtrl.resetTracks();

                // Create search result items
                searchResult.forEach(el => UICtrl.create(el.href, el.name, el.preview_url))
            }
        });


    }
const loadRecommendations = async () => {
    // Get the token
    const token = await APICtrl.getToken();
    // Store the token onto the page
    UICtrl.storeToken(token);

    // Get recommendations playlists
    const recommendations = await APICtrl.getRecommendations(token, 5);

    // Populate recommendations playlists
    recommendations.forEach(recommendation => {
        UICtrl.createRecommendationPlaylist(recommendation.id, recommendation.name, recommendation);
    });
}

    // get input field object ref
    const DOMInputs = UICtrl.inputField();

    // get genres on page load
    const loadGenres = async () => {
        //get the token
        const token = await APICtrl.getToken();           
        //store the token onto the page
        UICtrl.storeToken(token);
        //get the genres
        const genres = await APICtrl.getGenres(token);
        //populate our genres select element
        genres.forEach(element => UICtrl.createGenre(element.name, element.id));
    }

   

    // create genre change event listener
    DOMInputs.genre.addEventListener('change', async () => {
        //reset the playlist
        UICtrl.resetPlaylist();
        //get the token that's stored on the page
        const token = UICtrl.getStoredToken().token;        
        // get the genre select field
        const genreSelect = UICtrl.inputField().genre;       
        // get the genre id associated with the selected genre
        const genreId = genreSelect.options[genreSelect.selectedIndex].value;             
        // ge the playlist based on a genre
        const playlist = await APICtrl.getPlaylistByGenre(token, genreId);       
        // create a playlist list item for every playlist returned
        playlist.forEach(p => UICtrl.createPlaylist(p.name, p.tracks.href));
    });
     

    // create submit button click event listener
    DOMInputs.submit.addEventListener('click', async (e) => {
        // prevent page reset
        e.preventDefault();
        // clear tracks
        UICtrl.resetTracks();
        //get the token
        const token = UICtrl.getStoredToken().token;        
        // get the playlist field
        const playlistSelect = UICtrl.inputField().playlist;
        // get track endpoint based on the selected playlist
        const tracksEndPoint = playlistSelect.options[playlistSelect.selectedIndex].value;
        // get the list of tracks
        const tracks = await APICtrl.getTracks(token, tracksEndPoint);
        // create a track list item
 tracks.forEach(el => UICtrl.createTrack(el.track.href, el.track.name, el.track.preview_url))        
    });

    // create song selection click event listener
    DOMInputs.tracks.addEventListener('click', async (e) => {
        // prevent page reset
        e.preventDefault();
        UICtrl.resetTrackDetail();
        // get the token
        const token = UICtrl.getStoredToken().token;
        // get the track endpoint
        const trackEndpoint = e.target.id;
        //get the track object
        const track = await APICtrl.getTrack(token, trackEndpoint);

          const previewUrl = e.target.getAttribute('data-preview');
        // load the track details
        UICtrl.createTrackDetail(track.album.images[2].url, track.name, track.artists[0].name, previewUrl);
    });    
    
    document.getElementById('search-results').addEventListener('click', async (e) => {
        // prevent page reset
        e.preventDefault();
        UICtrl.resetTrackDetail();
        // get the token
        const token = UICtrl.getStoredToken().token;
        // get the track endpoint
        const trackEndpoint = e.target.id;
        //get the track object
        const track = await APICtrl.getTrack(token, trackEndpoint);

          const previewUrl = e.target.getAttribute('data-preview');
        // load the track details
        UICtrl.createTrackDetail(track.album.images[2].url, track.name, track.artists[0].name, previewUrl);
    });    
    
       // Add click event listener to the created playlist item
       document.getElementById('recommendations').addEventListener('click', async (e) => {
       try {
        const playlistId = e.target.id;

        // Fetch playlist details
        const playlistDetails = await APICtrl.getPlaylistDetails(UICtrl.getStoredToken().token, playlistId);

        // Call UIController method to display playlist details

        // If you want to display track details from the first track in the playlist
        if (playlistDetails.tracks.items.length > 0) {
            const track = playlistDetails.tracks.items;

            // Load the track details
            track.forEach(el => UICtrl.createRecommendationPlaylistDetail(el.track.href, el.track.name, el.track.preview_url))        
        }
    } catch (error) {
        console.error('Error fetching playlist details', error);
    }
    });

    return {
        init() {
            console.log('App is starting');
            loadGenres();
             initSearch();
             loadRecommendations();        
     
        }
    }

})(UIController, APIController);

// will need to call a method to load the genres on page load
APPController.init();