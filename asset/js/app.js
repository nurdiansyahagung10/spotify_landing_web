

var limitrecomend = 4;

function recommend_animate() {
    const recomenddiv = document.getElementById('recomenddiv');
    
    // Dapatkan batas rekomendasi saat ini
    const currentLimit = APPController.getRecommendationLimit();

    // Ganti batas rekomendasi antara 20 dan 4
    if (currentLimit === 24) {
        // Jika batas saat ini adalah 10, setel ke 4 dan hapus konten rekomendasi
        APPController.handleRecommendationLimitChange(4);
        recomenddiv.innerHTML = '';
    } else {
        // Jika batas saat ini bukan 10, setel ke 10
        APPController.handleRecommendationLimitChange(24);
    }

    // Tampilkan atau sembunyikan animasi sesuai dengan keadaan terkini
    recomenddiv.classList.toggle('align-items-center');

    // Log batas rekomendasi saat ini
    console.log(APPController.getRecommendationLimit());
}


// function untuk mengelola api
const APIController = (function() {

    // client
    const clientId = 'a765c74c00434237bac660d7bfdee98e';
    const clientSecret = 'cc40448c4cec4648a42a3a7979910739';

    // membuat token dari user
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
    
    // function mengambil rekomendasi
    const _getRecommendations = async (token, limit) => {
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

    console.log(selectedPlaylists);
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

// melihat playlist secara detail
const _getPlaylistDetails = async (token, playlistId) => {
    const result = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
    });

    const data = await result.json();
    console.log(data);
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

// membuat player music
  const _getTrack = async (token, trackEndPoint) => {

        const result = await fetch(`${trackEndPoint}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data;
    }

    // membuat keluaran untuk di panggil
    return{
         getToken() {
            return _getToken();
        },
        getTrack(token, trackEndPoint) {
            return _getTrack(token, trackEndPoint);
        },
             getRecommendations(token, limit) {
        return _getRecommendations(token, limit);
    },
      getPlaylistDetails(token, playlistId) {
        return _getPlaylistDetails(token, playlistId);
    },
      searchTracks(token, searchTerm) {
            return _searchTracks(token, searchTerm);
        },
    }
})();

// function untuk mengelola tampilan
const UIController = (function() {
        const DOMElements = {
        recomenddiv: '#recomenddiv',
        data: '#data',
        hfToken: '#hidden_token',

    }

    return{

        inputField() {
            return {
                recomenddiv: document.querySelector(DOMElements.recomenddiv),
                data: document.querySelector(DOMElements.data)

            }
        },

         
                storeToken(value) {
            document.querySelector(DOMElements.hfToken).value = value;
        },

        getStoredToken() {
            return {
                token: document.querySelector(DOMElements.hfToken).value
            }
        },

           resetTrackDetail() {
            DOMElements.data.innerHTML = '';
        },

        createSearchResult(id, name,img) {
            const html = `
             <div class="col" id="${id}">
        <div class="card h-100">
            <img src="${img}" class="card-img-top" alt="...">
            <div class="card-body">
                <h5 class="card-title">${name}</h5>
                <p class="card-text">This is a longer card with supporting text below as a natural lead-in to additional
                    content. This content is a little bit longer.</p>
            </div>
        </div>
    </div>
            `;
    document.getElementById('search-results').insertAdjacentHTML('beforeend', html);
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


           resetSearchResults() {
            document.getElementById('search-results').innerHTML = '';
        },


         createPlaylistsongdetail(img, title, artist, previewUrl, url) {
            const detailDiv = document.querySelector('#player');
            const holder = document.querySelector('.holder');
            const notpreview = document.querySelector('#notpreview');
            // Any time the user clicks a new song, clear out the song detail div

            if(previewUrl !== "null"){
                                holder.classList.remove("d-none");
                                notpreview.classList.add("d-none");

            }else{
                holder.classList.add("d-none");
                notpreview.classList.remove('d-none');
            }
            detailDiv.innerHTML = '';

            const html =
                `
       
                            <img src="${img}"
                                style="width: 45px; height: 45px;" class="img-fluid rounded-1 " alt="">
                            <a href="${url}" class="d-flex flex-column text-black" style="text-decoration: none;" target="_blank">
                                <span class="fw-bold small">${artist.name}</span>
                                <span class="small">${title}</span>
                            </a>
            `;

            detailDiv.insertAdjacentHTML('beforeend', html);


            // Set the audio source
            const player = document.querySelector('#player-song');
            // Any time the user clicks a new song, clear out the song detail div
            player.innerHTML = '';

            const music =
                `
       
                            <source src="${previewUrl}" type="audio/mp3">
            `;

            player.insertAdjacentHTML('beforeend', music);

            // Set the audio source
            const audioPlayer = document.getElementById('player-song');
            audioPlayer.src = previewUrl;        
        },

            
           createRecommendationPlaylist(id, name, data) {
    const images = data.images;
    const coverUrl = images.length > 0 ? images[0].url : 'default_cover_url'; // Provide a default cover URL if no images are available

    const html = `
        <div class="col-md col-12 d-flex justify-content-center playlist-recommend flex-column" ><small>${name}</small><img src="${coverUrl}"  id="${id}" class="img-fluid"></div>`;
    document.querySelector(DOMElements.recomenddiv).insertAdjacentHTML('beforeend', html);

    // Add click event listener to the created playlist item
},


           profilplaylist(id, name, data,description,followers, owner) {
                        const playlistopen = document.querySelector('#playlist-open');

    const images = data.images;
    const coverUrl = images.length > 0 ? images[0].url : 'default_cover_url'; // Provide a default cover URL if no images are available

    
                        playlistopen.innerHTML = '';

            const open_playlist =
                `
       
                    <a href="${data.external_urls.spotify}" class="text-black " target="_blank" style="text-decoration: none;">
                <i class='bx bx-heart fs-5'></i><span class="fs-5 ms-3">Open In
                        Officel Website</span>
                        </a>
            `;

            playlistopen.insertAdjacentHTML('beforeend', open_playlist);



      const profil = `
      <div class="col-12 d-flex flex-md-row flex-column " >
                          <div id="${id}" class="p-4 mx-auto" style ="height:300px;">
                        <img src="${coverUrl}" class=" h-100 shadow"  alt="">
                    </div>
                    <div class="flex-fill p-4 d-flex flex-column justify-content-between">
                        <span>Playlist</span>
                        <div>
                            <h1 style="font-size:5em;">${name}</h1>
                            <span class="small text-secondary" style="font-weight: 500;">${description}</span><br>
                            <div class="d-flex">
                                  <i class='bx bxl-spotify fs-5 ' style=" color: #1ed760;"></i>

                                  <span class="small" style="font-weight: 500;"><a href="${owner.external_urls.spotify}" target="_blank" class="text-black" style="text-decoration: none;">${owner.display_name}</a> • ${followers} Followers • ${data.tracks.items.length} Song</span>
                            </div>

                        </div>
                    </div>
                    </div>
                `;

let element = document.querySelector('#profilplaylist');

                if (element) {
    document.querySelector('#profilplaylist').insertAdjacentHTML('beforeend', profil);
                }
    // Add click event listener to the created playlist item
},



createRecommendationPlaylistDetail(angka,id,name,albumname,added_at,duration_ms,images,artist,previewUrl) {
    // Tanggal yang diberikan
var tanggalStr = added_at;

// Buat objek Date dari string
var tanggalObj = new Date(tanggalStr);

// Ambil bagian tanggal yang diinginkan
var bulan = tanggalObj.toLocaleString('default', { month: 'short' });
var tanggal = tanggalObj.getDate();
var tahun = tanggalObj.getFullYear();

// Format tanggal sesuai yang diinginkan
var tanggalHasil = bulan + " " + tanggal + "," + tahun;

// Durasi dalam milidetik
var durationMs = duration_ms;

// Hitung menit dan detik
var detik = Math.floor(durationMs / 1000);
var menit = Math.floor(detik / 60);
detik = detik % 60;

// Format waktu
var waktuHasil = pad(menit) + ":" + pad(detik);

// Fungsi untuk menambahkan nol di depan angka jika kurang dari 10
function pad(angka) {
    return angka < 10 ? "0" + angka : angka;
}

                const html = `
                    <tr id="${id}" data-preview="${previewUrl}">
                            <td class="small text-secondary">${angka}</td>
                            <td class="small text-secondary d-flex gap-2 align-items-center" ><img src="${images}" class="img-fluid rounded-1" style="width: 30px; height: 30px;" alt="">
                            <div class="d-flex flex-column"><span class="small fw-bold">${name}</span> <span class="small">${artist}</span></div>
                            </td>
                            <td class="small text-secondary">${albumname}</td>
                            <td class="small text-secondary ">${tanggalHasil}</td>
                            <td class="small text-secondary">${waktuHasil}</td>
                            <td class="small text-secondary"><i class='bx bxs-right-arrow '  ></i></td>
                </tr>
                `;


                let element = document.querySelector('#data');

                if(element){
    document.querySelector('#data').insertAdjacentHTML('beforeend', html);

                }
              
},


    }

})();
const APPController = (function(UICtrl, APICtrl) {

  const initSearch = () => {

        // Add event listener for search form submission
        document.getElementById('search-form').addEventListener('submit', async function (e) {
            e.preventDefault();
            const searchTerm = document.getElementById('search').value;
            if (searchTerm.trim() !== '') {
                const token = UICtrl.getStoredToken().token;
                const searchResult = await APICtrl.searchTracks(token, searchTerm);
                // Clear existing search results, tracks, and track details
                UICtrl.resetSearchResults();
                 if (searchResult.length > 0) {
            const search = searchResult;

            // Save data to localStorage
            localStorage.setItem('searchdata', JSON.stringify(search));

            // Navigate to another page
            window.location.href = 'searchresult.html';
        }
                // Create search result items
            }
        });


    }

   const loadRecommendations = async (limit) => {
        // Get the token
        const token = await APICtrl.getToken();
        // Store the token onto the page
        UICtrl.storeToken(token);

        // Get recommendations playlists
        const recommendations = await APICtrl.getRecommendations(token, limit);

        // Populate recommendations playlists
        recommendations.forEach(recommendation => {
            UICtrl.createRecommendationPlaylist(recommendation.id, recommendation.name, recommendation);
        });
    }

    // get input field object ref
    const DOMInputs = UICtrl.inputField();

    if (typeof recomenddiv !== 'undefined') {
    DOMInputs.recomenddiv.addEventListener('click', async (e) => {
    try {
            localStorage.removeItem('playlistData');
            localStorage.removeItem('playlist');

        const playlistId = e.target.id;

        // Fetch playlist details
        const playlistDetails = await APICtrl.getPlaylistDetails(UICtrl.getStoredToken().token, playlistId);

        // If you want to display track details from the first track in the playlist
        if (playlistDetails.tracks.items.length > 0) {
            const track = playlistDetails.tracks.items;

            // Save data to localStorage
            localStorage.setItem('playlistData', JSON.stringify(track));
            localStorage.setItem('playlist', JSON.stringify(playlistDetails));

            // Navigate to another page
            window.location.href = 'detailplaylist.html';
        }
    } catch (error) {
        console.error('Error fetching playlist details', error);
    }
});        
    }

     const setRecommendationLimit = (newLimit) => {
        limitrecomend = newLimit;
    }

    // Fungsi untuk mendapatkan batas rekomendasi
    const getRecommendationLimit = () => {
        return limitrecomend;
    }

    // Fungsi untuk menangani pengaturan batas rekomendasi dan memuat ulang rekomendasi
    const handleRecommendationLimitChange = (newLimit) => {
        setRecommendationLimit(newLimit);
        loadRecommendations(newLimit);
    }
  
    document.addEventListener('DOMContentLoaded', () => {
    // Retrieve data from localStorage
    const jsonData = JSON.parse(localStorage.getItem('playlistData'));
    const jsonDataplaylist = JSON.parse(localStorage.getItem('playlist'));
    const jsonDataresult = JSON.parse(localStorage.getItem('searchdata'));
    console.log(jsonDataresult);
        let angka = 1;

                if (jsonDataplaylist !== null) {

    UICtrl.profilplaylist(jsonDataplaylist.id, jsonDataplaylist.name, jsonDataplaylist,jsonDataplaylist.description,jsonDataplaylist.followers.total, jsonDataplaylist.owner);        
                }
                if (jsonDataresult !== null) {
                  
                jsonDataresult.forEach(el => UICtrl.createSearchResult(el.href, el.name, el.album.images[2].url))
                }

        if (jsonData && jsonData.length > 0) {
        jsonData.forEach(   el => UICtrl.createRecommendationPlaylistDetail(angka++,el.track.href,el.track.name,el.track.album.name ,el.added_at,el.track.duration_ms,el.track.album.images[2].url,el.track.artists[0].name,el.track.preview_url));        
    }

});


    if (typeof data !== 'undefined') {

    document.getElementById('data').addEventListener('click', async (e) => {
        // prevent page reset
        e.preventDefault();
            const clickedTr = e.target.closest('tr');
            console.log(clickedTr);
 if (clickedTr) {
        // get the token
        const token = UICtrl.getStoredToken().token;
        // get the track endpoint
        const trackEndpoint = clickedTr.id;
        //get the track object
        const track = await APICtrl.getTrack(token, trackEndpoint);

          const previewUrl = clickedTr.getAttribute('data-preview');
              playPause.attributes.d.value = "M18 12L0 24V0";
            player.pause();

        // load the track details
        UICtrl.createPlaylistsongdetail(track.album.images[2].url, track.name, track.artists[0], previewUrl, track.external_urls.spotify);
        
    }
    });    
}    



    return {
        init: () => {
            // Panggil fungsi untuk memuat rekomendasi dengan batas awal
            loadRecommendations(limitrecomend);
            initSearch();
        },
        setRecommendationLimit: setRecommendationLimit,
        getRecommendationLimit: getRecommendationLimit,
        handleRecommendationLimitChange: handleRecommendationLimitChange
    };

})(UIController, APIController);

// will need to call a method to load the genres on page load
APPController.init();

var audioPlayer = document.querySelector('.green-audio-player');
var playPause = audioPlayer.querySelector('#playPause');
var playpauseBtn = audioPlayer.querySelector('.play-pause-btn');
var loading = audioPlayer.querySelector('.loading');
var progress = audioPlayer.querySelector('.progress');
var sliders = audioPlayer.querySelectorAll('.slider');
var volumeBtn = audioPlayer.querySelector('.volume-btn');
var volumeControls = audioPlayer.querySelector('.volume-controls');
var volumeProgress = volumeControls.querySelector('.slider .progress');
var player = audioPlayer.querySelector('audio');
var currentTime = audioPlayer.querySelector('.current-time');
var totalTime = audioPlayer.querySelector('.total-time');
var speaker = audioPlayer.querySelector('#speaker');

var draggableClasses = ['pin'];
var currentlyDragged = null;

window.addEventListener('mousedown', function(event) {
  
  if(!isDraggable(event.target)) return false;
  
  currentlyDragged = event.target;
  let handleMethod = currentlyDragged.dataset.method;
  
  this.addEventListener('mousemove', window[handleMethod], false);

  window.addEventListener('mouseup', () => {
    currentlyDragged = false;
    window.removeEventListener('mousemove', window[handleMethod], false);
  }, false);  
});

playpauseBtn.addEventListener('click', togglePlay);
player.addEventListener('timeupdate', updateProgress);
player.addEventListener('volumechange', updateVolume);
player.addEventListener('loadedmetadata', () => {
  totalTime.textContent = formatTime(player.duration);
});
player.addEventListener('canplay', makePlay);
player.addEventListener('ended', function(){
  playPause.attributes.d.value = "M18 12L0 24V0";
  player.currentTime = 0;
});

volumeBtn.addEventListener('click', () => {
  volumeBtn.classList.toggle('open');
  volumeControls.classList.toggle('hidden');
})

window.addEventListener('resize', directionAware);

sliders.forEach(slider => {
  let pin = slider.querySelector('.pin');
  slider.addEventListener('click', window[pin.dataset.method]);
});

directionAware();

function isDraggable(el) {
  let canDrag = false;
  let classes = Array.from(el.classList);
  draggableClasses.forEach(draggable => {
    if(classes.indexOf(draggable) !== -1)
      canDrag = true;
  })
  return canDrag;
}

function inRange(event) {
  let rangeBox = getRangeBox(event);
  let rect = rangeBox.getBoundingClientRect();
  let direction = rangeBox.dataset.direction;
  if(direction == 'horizontal') {
    var min = rangeBox.offsetLeft;
    var max = min + rangeBox.offsetWidth;   
    if(event.clientX < min || event.clientX > max) return false;
  } else {
    var min = rect.top;
    var max = min + rangeBox.offsetHeight; 
    if(event.clientY < min || event.clientY > max) return false;  
  }
  return true;
}

function updateProgress() {
  var current = player.currentTime;
  var percent = (current / player.duration) * 100;
  progress.style.width = percent + '%';
  
  currentTime.textContent = formatTime(current);
}

function updateVolume() {
  volumeProgress.style.height = player.volume * 100 + '%';
  if(player.volume >= 0.5) {
    speaker.attributes.d.value = 'M14.667 0v2.747c3.853 1.146 6.666 4.72 6.666 8.946 0 4.227-2.813 7.787-6.666 8.934v2.76C20 22.173 24 17.4 24 11.693 24 5.987 20 1.213 14.667 0zM18 11.693c0-2.36-1.333-4.386-3.333-5.373v10.707c2-.947 3.333-2.987 3.333-5.334zm-18-4v8h5.333L12 22.36V1.027L5.333 7.693H0z';  
  } else if(player.volume < 0.5 && player.volume > 0.05) {
    speaker.attributes.d.value = 'M0 7.667v8h5.333L12 22.333V1L5.333 7.667M17.333 11.373C17.333 9.013 16 6.987 14 6v10.707c2-.947 3.333-2.987 3.333-5.334z';
  } else if(player.volume <= 0.05) {
    speaker.attributes.d.value = 'M0 7.667v8h5.333L12 22.333V1L5.333 7.667';
  }
}

function getRangeBox(event) {
  let rangeBox = event.target;
  let el = currentlyDragged;
  if(event.type == 'click' && isDraggable(event.target)) {
    rangeBox = event.target.parentElement.parentElement;
  }
  if(event.type == 'mousemove') {
    rangeBox = el.parentElement.parentElement;
  }
  return rangeBox;
}

function getCoefficient(event) {
  let slider = getRangeBox(event);
  let rect = slider.getBoundingClientRect();
  let K = 0;
  if(slider.dataset.direction == 'horizontal') {
    
    let offsetX = event.clientX - slider.offsetLeft;
    let width = slider.clientWidth;
    K = offsetX / width;    
    
  } else if(slider.dataset.direction == 'vertical') {
    
    let height = slider.clientHeight;
    var offsetY = event.clientY - rect.top;
    K = 1 - offsetY / height;
    
  }
  return K;
}

function rewind(event) {
  if(inRange(event)) {
    player.currentTime = player.duration * getCoefficient(event);
  }
}

function changeVolume(event) {
  if(inRange(event)) {
    player.volume = getCoefficient(event);
  }
}

function formatTime(time) {
  var min = Math.floor(time / 60);
  var sec = Math.floor(time % 60);
  return min + ':' + ((sec<10) ? ('0' + sec) : sec);
}

function togglePlay() {
  if(player.paused) {
    playPause.attributes.d.value = "M0 0h6v24H0zM12 0h6v24h-6z";
    player.play();
  } else {
    playPause.attributes.d.value = "M18 12L0 24V0";
    player.pause();
  }  
}

function makePlay() {
  playpauseBtn.style.display = 'block';
  loading.style.display = 'none';
}

function directionAware() {
  if(window.innerHeight < 250) {
    volumeControls.style.bottom = '-54px';
    volumeControls.style.left = '54px';
  } else if(audioPlayer.offsetTop < 154) {
    volumeControls.style.bottom = '-164px';
    volumeControls.style.left = '-3px';
  } else {
    volumeControls.style.bottom = '52px';
    volumeControls.style.left = '-3px';
  }
}