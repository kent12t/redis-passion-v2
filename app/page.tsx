import Quiz from './components/Quiz';
import questions from './data/questions.json';

export default function Home() {
  return (
    <main>
      <Quiz questions={questions} />
    </main>
  );
}
