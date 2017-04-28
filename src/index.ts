import 'reflect-metadata'; // Required for inversify
import { app } from './app';

app.listen(3000, () => {
  console.log('App listening on port 3000');
});
