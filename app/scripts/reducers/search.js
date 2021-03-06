import { List, fromJS } from 'immutable';
import numeral from 'numeral';
import trimStart from 'lodash/trimStart';
import constants from 'constants/';
import { createReducer } from 'utils/';

const initialState = new fromJS({
  youtube: [],
  soundcloud: [],
  kakapofavs: []
});

const searchReducers = {
  formatDuration(seconds) {
    const formatted = trimStart(numeral(seconds).format('00:00:00'), '0:');
    return formatted.indexOf(':') === -1 ? `0:${formatted}` : formatted;
  },

  // Convert YouTube ISO8061 duration string
  parseDuration(duration) {
    let seconds = 0;
    duration.match(/[0-9]+[HMS]/g).forEach(part => {
      let unit = part.charAt(part.length-1);
      let amount = parseInt(part.slice(0,-1));
      switch (unit) {
        case 'H':
          seconds += amount*60*60;
          break;
        case 'M':
          seconds += amount*60;
          break;
        case 'S':
          seconds += amount;
          break;
      }
    });
    return seconds;
  },

  // YouTube Listeners
  mapYoutube(results) {
    return results.map(_y => ({
      desc: _y.snippet.description,
      duration: this.formatDuration(this.parseDuration(_y.duration)),
      img: _y.snippet.thumbnails.high.url,
      name: _y.snippet.title,
      tags: '',
      videoId: _y.id.videoId,
      viewCount: parseInt(_y.viewCount, 0)
    }));
  },

  // SoundCloud Listeners
  mapSoundcloud(results) {
    return results.map(_y => ({
      desc: _y.description,
      duration: this.formatDuration(numeral(_y.duration / 1000)),
      img: 'https://w.soundcloud.com/icon/assets/images/orange_white_128-e278832.png',
      name: _y.title,
      tags: _y.tag_list,
      scId: parseInt(_y.id, 0),
      userAvatar: _y.user.avatar_url,
      viewCount: _y.playback_count
    }));
  },

  // KakapoFavourites Listeners
  mapKakapo(results) {
    return results.map(_y => ({ ..._y, ...{
      desc: _y.description,
      img: _y.img,
      name: _y.name,
      tags: _y.tags,
      url: _y.url
    } }));
  }
};

export default createReducer(initialState, {
  [constants.SEARCH_YOUTUBE]: (state, action) => {
    return state.update('youtube', () => List(searchReducers.mapYoutube(action.items)));
  },
  [constants.SEARCH_SOUNDCLOUD]: (state, action) => {
    return state.update('soundcloud', () => List(searchReducers.mapSoundcloud(action.items)));
  },
  [constants.SEARCH_KAKAPO]: (state, action) => {
    return state.update('kakapofavs', () => List(searchReducers.mapKakapo(action.items)));
  }
});
