// Một số bài hát có thể bị lỗi do liên kết bị hỏng. Vui lòng thay thế liên kết khác để có thể phát
// Some songs may be faulty due to broken links. Please replace another link so that it can be played

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8-PLayer'

const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('.progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playList = $('.playlist')

const start = $(".start")
const end = $(".end")
const volumeDown = $('.volumeDown')
const volumeMute = $('.volumeMute')
const volumeUp = $('.volumeUp')
const progressVolume = $('.volume input')



const api = "https://api.apify.com/v2/key-value-stores/EJ3Ppyr2t73Ifit64/records/LATEST?fbclid=IwAR1WLvmt1_SejwdlmWLLaN4kfTTeI4PPNw6v67QKDhp4woRWKRkfRj9RFC4"

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
  },
  songs: [

  ],
  getData:  function (callback) {
    return fetch(api)
      .then(function (respon) {
        return respon.json();
      })
      .then(function (data) {
        app.songs = data.songs.top100_VN[0].songs;
        return (callback)
      })
  },
  render: function () {
    const html = this.songs.map((song, index) => {
      return `
            <div class="song  ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
            <div class="thumb" style="background-image: url('${song.bgImage}')"></div>
            <div class="body">
                <h3 class="title">${song.title}</h3>
                <p class="author">${song.creator}</p>
            </div>
            <div class="option">
                <i class="fas fa-ellipsis-h"></i>
            </div>
            </div>
            `
    })
    playList.innerHTML = html.join('')
  },
  handleEvent: function () {
    const _this = this
    const cdWidth = cd.offsetWidth

    //xu ly CD quay va dung
    const cdThumbAnimate = cdThumb.animate([{
      transform: "rotate(360deg)"
    }], {
      duration: 10000, // 10 seconds
      iterations: Infinity
    });
    cdThumbAnimate.pause();

    //xu ly phong to thu nho cv
    document.onscroll = function () {
      const scrolltop = document.documentElement.scrollTop
      const newCdWidth = cdWidth - scrolltop


      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0
      cd.style.opacity = newCdWidth / cdWidth;
    }

    //xu ly khi click play
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause()
      } else {
        audio.play()
      }


    }
    //Khi song bi pause 
    audio.onpause = function () {
      _this.isPlaying = false
      player.classList.remove('playing')
      cdThumbAnimate.pause()
    }

    //Khi song duoc player 
    audio.onplay = function () {
      _this.isPlaying = true
      player.classList.add('playing')
      cdThumbAnimate.play()


    }

    //khi tien do bai hat thay doi
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
        progress.value = progressPercent
        _this.loadTimeSongChange();

      }
    }

    audio.onplaying = function () {
      _this.loadTimeSong()
    }

    //xu ly khi tua song
    progress.onchange = function (e) {
      const seekTime = audio.duration / 100 * e.target.value;
      audio.currentTime = seekTime;

    }

    //khi next bai hat
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      }
      else {
        _this.nextSong();


      }
      audio.play();
      _this.render()
      _this.scrollToActiveSong()


    }
    //khi prev bai hat
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      }
      else {
        _this.prevSong();

      }
      audio.play();
      _this.render()
      _this.scrollToActiveSong()
    }
    //khi random 
    randomBtn.onclick = function (e) {
      _this.isRandom = !_this.isRandom
      _this.setConfig('isRandom', _this.isRandom)
      randomBtn.classList.toggle("active", _this.isRandom)

    }

    //xu ly next khi audio ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play()
      } else {
        nextBtn.click()
      }

    }

    //xu ly lap lai 1 song
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig('isRepeat', _this.isRepeat)
      repeatBtn.classList.toggle("active", _this.isRepeat)
    }

    //lang nghe hanh vi click vao playlist
    playList.onclick = function (e) {
      const songNode = e.target.closest('.song:not(.active)')
      if (songNode || e.target.closest('.option')) {


        if (songNode) {
          //songNode.getAttribute('data-index')

          _this.currentIndex = Number(songNode.dataset.index)
          _this.loadCurrentSong()
          _this.render()
          audio.play()
        }
        if (e.target.closest('.option')) {

        }

      }
    }

    //khi thay doi am luong
    progressVolume.onchange = function(e) {
      audio.volume=e.target.value /100
      //console.log(audio.volume)
      if(audio.volume == 0.01) {
        volumeDown.style.display="none";
        volumeMute.style.display="block"
        volumeUp.style.display="none"
      }
      else if (audio.volume == 1){
        volumeDown.style.display="none";
        volumeMute.style.display="none";
        volumeUp.style.display="block"
      }
      else{
        volumeDown.style.display="block";
        volumeMute.style.display="none"
        volumeUp.style.display="none"
      }
    }


  },
  //20:00
  defineProperties: function () {
    Object.defineProperty(this, 'currentSong', {
      get: function () {
        return this.songs[this.currentIndex]
      }
    })

  },
  loadCurrentSong: function () {

    heading.textContent = this.currentSong.title
    cdThumb.style.backgroundImage = `url('${this.currentSong.bgImage}')`;
    audio.src = this.currentSong.music

   




  },
  nextSong: function () {
    this.currentIndex++
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong()
  },

  prevSong: function () {
    this.currentIndex--
    
    if (this.currentIndex <0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong()
  },
  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length)
    }
    while (newIndex == this.currentIndex)

    this.currentIndex = newIndex
    this.loadCurrentSong();
  },
  scrollToActiveSong: function () {
    setTimeout(() => {
      $('.song.active').scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })

    }, 300)
  },
  loadTimeSong: function () {
    if (Math.floor(audio.duration) % 60 < 10) {
      end.innerHTML = `${Math.floor(Math.floor(audio.duration) / 60)}:0${Math.floor(audio.duration) % 60}`
    }
    else {
      end.innerHTML = `${Math.floor(Math.floor(audio.duration) / 60)}:${Math.floor(audio.duration) % 60}`
    }


  },
  loadTimeSongChange: function () {
    if (Math.floor(audio.currentTime) % 60 < 10) {
      start.innerHTML = `${Math.floor(Math.floor(audio.currentTime) / 60)}:0${Math.floor(parseInt(audio.currentTime)) % 60}`
    } else {
      start.innerHTML = `${Math.floor(Math.floor(audio.currentTime) / 60)}:${Math.floor(parseInt(audio.currentTime)) % 60}`
    }
  },

  start: async function () {



    await this.getData(this.render())
    this.defineProperties();
    this.handleEvent();

    this.loadCurrentSong();

    this.render();
  }
}

// app.getData();
// var a =setTimeout(app.loadCurrentSong(),10000)

app.start();

let isVolume = false;
//console.log($$(".volume i")) 
$$(".volume i").forEach(element => {
 element.onclick = function() {

    isVolume = !(isVolume);
   
    (isVolume) ? progressVolume.style.display="block" : progressVolume.style.display="none";
  }
});






























