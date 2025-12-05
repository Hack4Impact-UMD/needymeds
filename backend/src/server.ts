import app from './app';

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
app.listen(port, () => {
  console.log(`Server listening on :${port}`);
});
