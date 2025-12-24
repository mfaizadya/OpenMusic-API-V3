class Listener {
  constructor(playlistsService, mailSender) {
    this._playlistsService = playlistsService;
    this._mailSender = mailSender;

    this.listen = this.listen.bind(this);
  }

  async listen(message) {
    try {
      const { playlistId, targetEmail } = JSON.parse(message.content.toString());

      const result = await this._playlistsService.getPlaylistSongs(playlistId);
      await this._mailSender.sendEmail(targetEmail, JSON.stringify(result));
      
      console.log(`Email terkirim ke ${targetEmail}`);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = Listener;