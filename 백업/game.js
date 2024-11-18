import chalk from 'chalk';
import readlineSync from 'readline-sync';
import { start } from './server.js';

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class Player {
  constructor() {
    this.hp = 100;
    this.damage = 30;
    this.speed = 10;
  }

  attack(stage, player, monster) {
    // 플레이어의 공격
    monster.hp -= player.damage;
  }
  specUp(stage, player) {
    player.hp += 30 + Math.floor(Math.random() * 11);
    player.damage += 5 + Math.floor(Math.random() * 11);
  }
}

class Monster {
  constructor(stage) {
    this.hp = 50 + (stage * 10 + Math.floor(Math.random() * 11));
    this.damage = 5 + (stage * 1.5 + Math.floor(Math.random() * 5));
    this.speed = 5 + (stage * 1.5 + Math.floor(Math.random() * 2));
  }

  attack(stage, player, monster) {
    // 몬스터의 공격
    player.hp -= monster.damage;
  }
}

function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n=== Current Status ===`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage} `) +
      chalk.blueBright(
        `| 플레이어 HP: ${player.hp}, Damage: ${player.damage}, speed: ${player.speed} `,
      ) +
      chalk.redBright(
        `| 몬스터 HP: ${monster.hp}, Damage: ${monster.damage}, speed: ${monster.speed} |`,
      ),
  );
  console.log(chalk.magentaBright(`=====================\n`));
}

const battle = async (stage, player, monster) => {
  let logs = [];

  while (player.hp > 0 && monster.hp > 0) {
    console.clear();
    displayStatus(stage, player, monster);

    logs.forEach((log) => console.log(log));

    console.log(chalk.green(`\n1. 어택(100%) 2. 더블 어택(30%) 3. 쉴드(50%) 4. 탈출(99%)`));
    const choice = readlineSync.question('당신의 선택은? ');

    // 플레이어의 선택에 따라 다음 행동 처리
    logs.push(chalk.green(`${choice}를 선택하셨습니다.`));

    switch (choice) {
      case '1':
        if (player.speed >= monster.speed) {
          player.attack(stage, player, monster);
          logs.push(chalk.blue(`${player.damage}의 데미지를 입혔습니다.`));
          console.log(logs[logs.length - 1]);
          if (monster.hp > 0) {
            monster.attack(stage, player, monster);
            logs.push(chalk.red(`${monster.damage}의 데미지를 받았습니다.`));
            console.log(logs[logs.length - 1]);
          }
        } else if (player.speed < monster.speed) {
          monster.attack(stage, player, monster);
          logs.push(chalk.red(`${monster.damage}의 데미지를 받았습니다.`));
          console.log(logs[logs.length - 1]);

          if (player.hp > 0) {
            player.attack(stage, player, monster);
            logs.push(chalk.blue(`${player.damage}의 데미지를 입혔습니다.`));
            console.log(logs[logs.length - 1]);
          }
        }
        await delay(1000);
        break;

      case '2':
        if (player.speed >= monster.speed) {
          if (Math.floor(Math.random() * 3) === 0) {
            player.attack(stage, player, monster);
            logs.push(chalk.blue(`${player.damage}의 데미지를 입혔습니다.`));
            player.attack(stage, player, monster);
            logs.push(chalk.blue(`${player.damage}의 데미지를 입혔습니다.`));

            console.log(logs[logs.length - 1]);
          } else {
            logs.push(chalk.blue(`더블 어택 실패.`));
          }
          if (monster.hp > 0) {
            monster.attack(stage, player, monster);
            logs.push(chalk.red(`${monster.damage}의 데미지를 받았습니다.`));
            console.log(logs[logs.length - 1]);
          }
        } else if (player.speed < monster.speed) {
          monster.attack(stage, player, monster);
          logs.push(chalk.red(`${monster.damage}의 데미지를 받았습니다.`));
          console.log(logs[logs.length - 1]);

          if (player.hp > 0) {
            if (Math.floor(Math.random() * 3) === 0) {
              player.attack(stage, player, monster);
              logs.push(chalk.blue(`${player.damage}의 데미지를 입혔습니다.`));
              player.attack(stage, player, monster);
              logs.push(chalk.blue(`${player.damage}의 데미지를 입혔습니다.`));
            } else {
              logs.push(chalk.blue(`더블 어택 실패.`));
            }
          }
        }
        break;
      case '3':
        if (Math.floor(Math.random() * 2) === 0) {
          logs.push(chalk.red(`0의 데미지를 받았습니다.`));
          logs.push(chalk.blue(`방어에 성공했습니다.`));
        } else {
          logs.push(chalk.blue(`방어에 실패했습니다.`));
          logs.push(chalk.red(`${monster.damage}의 데미지를 받았습니다.`));
        }
        break;
      case '4':
        if (Math.floor(Math.random() * 99) === 0) {
          logs.push(chalk.green('탈출 실패.'));
          logs.push(chalk.red(`${monster.damage}의 데미지를 받았습니다.`));
        } else {
          logs.push(chalk.green('플레이어가 도망쳤습니다. 전투를 종료합니다.'));
          console.log(logs[logs.length - 1]);
          await delay(1000);
          return true;
        }
        break;
    }
  }
  return false;
};

export async function startGame() {
  console.clear();
  let player = new Player();
  let stage = 1;

  while (stage <= 11) {
    const monster = new Monster(stage);

    const excape = await battle(stage, player, monster);

    // 스테이지 클리어 및 게임 종료 조건
    if (excape) {
      return start();
    }
    if (stage === 11) {
      console.log(chalk.green('게임을 클리어했습니다. 메인화면으로 돌아갑니다.'));
      await delay(1000);
      return start();
    } else if (player.hp <= 0) {
      console.log(chalk.green('플레이어가 쓰러졌습니다. 게임이 종료됩니다.'));
      await delay(1000);
      return start();
    } else if (monster.hp <= 0) {
      console.log(chalk.green('몬스터가 쓰러졌습니다. 스테이지가 상승합니다.'));
      stage++;
      player.specUp(stage, player);
      await delay(1000);
    }
  }
}
