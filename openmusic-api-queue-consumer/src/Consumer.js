require('dotenv').config();
const amqp = require('amqplib');
const PlaylistsService = require('./PlaylistsService');
const MailSender = require('./MailSender');
const Listener = require('./Listener');

const init = async () => {
  console.log('Menginisialisasi layanan...');
  const playlistsService = new PlaylistsService();
  const mailSender = new MailSender();
  const listener = new Listener(playlistsService, mailSender);

  try {
    // Cek variabel environment
    const rabbitServer = process.env.RABBITMQ_SERVER;
    console.log(`Mencoba menghubungkan ke RabbitMQ di: ${rabbitServer}`);

    const connection = await amqp.connect(rabbitServer);
    console.log('Koneksi RabbitMQ berhasil terbuka!');

    const channel = await connection.createChannel();
    console.log('Channel berhasil dibuat.');

    await channel.assertQueue('export:playlists', {
      durable: true,
    });
    console.log('Queue "export:playlists" dipastikan ada.');

    channel.consume('export:playlists', listener.listen, { noAck: true });
    console.log('Consumer berjalan dan siap menerima pesan...');
    
  } catch (error) {
    console.error('\n!!! TERJADI ERROR SAAT KONEKSI !!!');
    console.error(error.message);
    
    // Tips troubleshooting berdasarkan error umum
    if (error.code === 'ECONNREFUSED') {
      console.error('Tips: Pastikan aplikasi RabbitMQ Server sudah diinstal dan dijalankan (bukan hanya library npm-nya).');
    }
  }
};

init();