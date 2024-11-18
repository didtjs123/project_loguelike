import chalk from 'chalk';
import figlet from 'figlet';
import readlineSync from 'readline-sync';
import { startGame } from './game.js';

function displayLobby() {
  console.clear();

  // 타이틀 텍스트
  console.log(
    chalk.cyan(
      figlet.textSync('Pokemon CLI', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default',
      }),
    ),
  );

  // 상단 경계선
  const line = chalk.magentaBright('='.repeat(50));
  console.log(line);

  // 메뉴
  console.log(chalk.blue('1.') + chalk.white(' 새로운 게임 시작'));
  console.log(chalk.blue('2.') + chalk.white(' 랭킹 확인 (미구현)'));
  console.log(chalk.blue('3.') + chalk.white(' 옵션'));
  console.log(chalk.blue('4.') + chalk.white(' 종료'));

  // 하단 경계선
  console.log(line);

  // 하단 설명
  console.log(chalk.gray('1-4 사이의 수를 입력한 뒤 엔터를 누르세요.'));
}

function handleUserInput() {
  const choice = readlineSync.question('입력: ');

  switch (choice) {
    case '1':
      console.clear();
      startGame(); // 이름과 초기 상태는 game.js에서 설정
      break;
    case '2':
      console.log(chalk.yellow('랭킹 확인은 현재 구현되지 않았습니다.'));
      handleUserInput();
      break;
    case '3':
      console.log(chalk.blue('옵션 메뉴는 구현 중입니다.'));
      handleUserInput();
      break;
    case '4':
      console.log(chalk.red('게임을 종료합니다.'));
      process.exit(0);
      break;
    default:
      console.log(chalk.red('올바른 선택을 하세요.'));
      handleUserInput();
  }
}

export function start() {
  displayLobby();
  handleUserInput();
}

start();
