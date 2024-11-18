import chalk from 'chalk';
import readlineSync from 'readline-sync';
import { start } from './server.js';

let playerName = ''; // 플레이어 이름
let currentBall = '몬스터볼'; // 현재 선택된 볼

// 포켓몬 클래스
class Pokemon {
  constructor(name, captureRate, escapeRate, score, speed, appearanceRate) {
    this.name = name; // 이름
    this.captureRate = captureRate; // 포획률
    this.escapeRate = escapeRate; // 도망률
    this.score = score; // 점수
    this.speed = speed; // 스피드
    this.appearanceRate = appearanceRate; // 출현 확률
  }
}

// 플레이어 클래스
class Player {
  constructor(name) {
    this.name = name;
    this.speed = 10;
    this.currentBall = currentBall;
    this.pokeballs = { 몬스터볼: Infinity, 수퍼볼: 10, 하이퍼볼: 3 };
    this.pokemons = [];
    this.escapesLeft = 10;
  }

  getTotalScore() {
    return this.pokemons.reduce((total, pokemon) => total + pokemon.score, 0);
  }

  changeBall(newBall) {
    if (this.pokeballs[newBall] > 0 || newBall === '몬스터볼') {
      this.currentBall = newBall;
      currentBall = newBall; // 글로벌 상태 업데이트
      console.log(chalk.green(`현재 볼이 ${newBall}로 변경되었습니다.`));
    } else {
      console.log(chalk.red(`남은 ${newBall}이 없습니다.`));
    }
  }

  capture(pokemon) {
    if (this.pokeballs[this.currentBall] <= 0 && this.currentBall !== '몬스터볼') {
      console.log(chalk.red(`남은 ${this.currentBall}이 없습니다. 볼을 변경해주세요.`));
      return false;
    }

    if (this.currentBall !== '몬스터볼') this.pokeballs[this.currentBall]--;

    const ballBonus = this.currentBall === '수퍼볼' ? 30 : this.currentBall === '하이퍼볼' ? 50 : 0;
    const finalCaptureRate = Math.min(pokemon.captureRate + ballBonus, 100);
    const captureSuccess = Math.random() * 100 < finalCaptureRate;

    if (captureSuccess) {
      this.pokemons.push(pokemon);
      console.log(chalk.green(`${pokemon.name}을(를) 포획했습니다! (${pokemon.score}점)`));
    } else {
      console.log(chalk.red(`${pokemon.name} 포획에 실패했습니다.`));
    }

    return captureSuccess;
  }
}

// 출현 포켓몬 리스트
const pokedex = [
  new Pokemon('피카츄', 80, 5, 2, 5, 40),
  new Pokemon('꼬부기', 80, 5, 1, 5, 50),
  new Pokemon('파이리', 80, 5, 1, 5, 50),
  new Pokemon('이상해씨', 80, 5, 1, 5, 50),
  new Pokemon('어니부기', 50, 15, 3, 12, 30),
  new Pokemon('리자드', 50, 15, 3, 12, 30),
  new Pokemon('이상해풀', 50, 15, 3, 12, 30),
  new Pokemon('이상해꽃', 30, 30, 5, 15, 10),
  new Pokemon('리자몽', 30, 30, 5, 15, 10),
  new Pokemon('거북왕', 30, 30, 5, 15, 10),
  new Pokemon('루기아', 10, 50, 8, 18, 5),
  new Pokemon('썬더', 10, 50, 8, 18, 5),
  new Pokemon('파이어', 10, 50, 8, 18, 5),
  new Pokemon('프리져', 10, 50, 8, 18, 5),
  new Pokemon('뮤', 5, 70, 20, 20, 2),
];

// 출현 포켓몬 결정 함수
function getRandomPokemon() {
  const totalRate = pokedex.reduce((sum, pokemon) => sum + pokemon.appearanceRate, 0);
  const random = Math.random() * totalRate;

  let cumulative = 0;
  for (const pokemon of pokedex) {
    cumulative += pokemon.appearanceRate;
    if (random < cumulative) {
      return pokemon;
    }
  }
  return pokedex[0];
}

// 현재 상태 출력
function displayCurrentStatus(player, pokemon) {
  console.log(chalk.magentaBright('\n=== Current Status ==='));
  console.log(chalk.cyanBright(`플레이어 이름: ${player.name}`));
  console.log(chalk.cyanBright(`선택한 볼: ${player.currentBall}`));
  console.log(chalk.cyanBright(`스피드: ${player.speed}`));
  console.log(chalk.cyanBright(`총 획득 점수: ${player.getTotalScore()}`));
  if (pokemon) {
    console.log(chalk.yellowBright('\n출현 포켓몬:'));
    console.log(chalk.greenBright(`이름: ${pokemon.name}`));
    console.log(chalk.greenBright(`점수: ${pokemon.score}`));
  }
  console.log(chalk.magentaBright('=======================\n'));
}

// 배틀 로직
const battle = async (stage, player) => {
  const wildPokemon = getRandomPokemon();
  console.clear();
  displayCurrentStatus(player, wildPokemon);
  console.log(chalk.yellow(`야생의 ${wildPokemon.name} (이)가 나타났다!`));

  while (true) {
    console.log(chalk.green('\n1. 포획하기 2. 볼 바꾸기 3. 내 포켓몬 보기 4. 탈출'));
    console.log(
      chalk.yellow(`현재 볼: ${player.currentBall} | 남은 탈출 기회: ${player.escapesLeft}`),
    );
    const choice = readlineSync.question('당신의 선택은? ');

    switch (choice) {
      case '1':
        if (player.speed >= wildPokemon.speed) {
          if (player.capture(wildPokemon)) return true;
        } else {
          if (Math.random() * 100 < wildPokemon.escapeRate) {
            console.log(chalk.red(`${wildPokemon.name}이(가) 도망쳤습니다!`));
            return false;
          }
          if (player.capture(wildPokemon)) return true;
        }
        break;

      case '2':
        console.log(
          chalk.green(
            `1. 몬스터볼(무한) 2. 수퍼볼(x${player.pokeballs['수퍼볼']}), 3. 하이퍼볼(${player.pokeballs['하이퍼볼']})`,
          ),
        );

        const ballChoice = readlineSync.question('변경할 볼을 선택하세요: ');
        if (ballChoice === '1') player.changeBall('몬스터볼');
        else if (ballChoice === '2') player.changeBall('수퍼볼');
        else if (ballChoice === '3') player.changeBall('하이퍼볼');
        break;

      case '3':
        console.log(chalk.magenta('=== 포획한 포켓몬 ==='));
        if (player.pokemons.length > 0) {
          player.pokemons.forEach((p, idx) => console.log(`${idx + 1}. ${p.name} (${p.score}점)`));
        } else {
          console.log(chalk.gray('아직 포획한 포켓몬이 없습니다.'));
        }
        break;

      case '4':
        if (player.escapesLeft > 0) {
          player.escapesLeft--;
          console.log(chalk.green('탈출하고 새로운 포켓몬을 탐색합니다.'));
          return false;
        } else {
          console.log(chalk.red('남은 탈출 기회가 없습니다.'));
        }
        break;

      default:
        console.log(chalk.red('올바른 선택을 하세요.'));
    }
  }
};

// 게임 시작
export async function startGame() {
  console.clear();
  playerName = readlineSync.question(chalk.yellow('플레이어 이름을 입력해주세요: '));
  const player = new Player(playerName);

  let stage = 1;

  while (stage <= 10) {
    console.clear();
    console.log(chalk.blueBright(`\n=== 스테이지 ${stage} ===`));
    const success = await battle(stage, player);

    if (success) {
      stage++;
      player.speed += Math.floor(Math.random() * 4);
      console.log(chalk.green(`스테이지 ${stage}로 진입합니다. 스피드 증가: ${player.speed}`));
    } else if (stage > 10) {
      const totalScore = player.getTotalScore();
      console.log(chalk.green(`게임 종료! 총 포획 점수: ${totalScore}`));
      return start();
    }
  }
}
