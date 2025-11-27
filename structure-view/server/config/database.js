import mysql from 'mysql2/promise';

// Configuração do banco de dados
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'structure_view',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Criar pool de conexões
const pool = mysql.createPool(dbConfig);

// Testar conexão
pool.getConnection()
  .then(connection => {
    console.log('✅ Conectado ao MySQL!');
    console.log(`📊 Banco de dados: ${dbConfig.database}`);
    connection.release();
  })
  .catch(err => {
    console.error('❌ Erro ao conectar ao MySQL:', err.message);
    console.error('💡 Verifique se:');
    console.error('   1. O MySQL está rodando');
    console.error('   2. O arquivo .env existe na pasta server/');
    console.error('   3. As credenciais no .env estão corretas');
    console.error('   4. O banco de dados "structure_view" foi criado');
  });

export default pool;

