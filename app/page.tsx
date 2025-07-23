import { Quiz } from './components';
import questions from './data/questions_en.json';

export default function Home() {
  return (
    <main className="w-full h-full">
      <Quiz questions={questions} />
    </main>
  );
}
