import { Quiz } from './components';
import questions from './data/questions.json';

export default function Home() {
  return (
    <main>
      <Quiz questions={questions} />
    </main>
  );
}
