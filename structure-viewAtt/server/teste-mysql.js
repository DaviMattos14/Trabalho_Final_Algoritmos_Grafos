import mysql from "mysql2";

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Guilherme@123"
});

connection.connect(err => {
  if (err) {
    console.error("ERRO:", err.message);
    return;
  }
  console.log("CONECTOU!");
  connection.end();
});
