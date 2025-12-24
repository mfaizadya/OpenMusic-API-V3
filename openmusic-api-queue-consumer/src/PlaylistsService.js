const { Pool } = require('pg');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async getPlaylistSongs(playlistId) {
    const query = {
      text: `SELECT songs.id, songs.title, songs.performer FROM songs
      LEFT JOIN playlist_songs ON playlist_songs.song_id = songs.id
      WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    
    // Kita juga butuh nama playlistnya agar struktur JSON sesuai kriteria
    const queryPlaylist = {
        text: 'SELECT id, name FROM playlists WHERE id = $1',
        values: [playlistId],
    };
    const playlistResult = await this._pool.query(queryPlaylist);
    
    if (!playlistResult.rows.length) {
        throw new Error('Playlist tidak ditemukan');
    }

    const playlist = playlistResult.rows[0];

    return {
      playlist: {
        id: playlist.id,
        name: playlist.name,
        songs: result.rows,
      },
    };
  }
}

module.exports = PlaylistsService;