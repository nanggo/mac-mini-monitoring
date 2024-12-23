// index.js
import axios from "axios";
import cheerio from "cheerio";
import TelegramBot from "node-telegram-bot-api";
import schedule from "node-schedule";
import dotenv from "dotenv";

dotenv.config();

// 텔레그램 봇 설정
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// 봇 초기화
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

// 모니터링할 URL
const URL = process.env.MONITOR_URL;

// 이전 상태 저장 (프로그램 실행 중에만 유지됨)
let isAvailable = false;

// 웹 페이지 상태 확인 함수
const checkAvailability = async () => {
  try {
    const response = await axios.get(URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        // 필요에 따라 추가 헤더를 설정하세요
      },
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // 특정 클래스가 있는 요소를 선택합니다.
    // 실제 셀렉터에 맞게 수정하세요.
    const button = $(".usItemButtons.usItemCartBuyButtons");

    if (button.length === 0) {
      console.log("버튼을 찾을 수 없습니다.");
      return;
    }

    const classList = button.attr("class");
    console.log(`현재 클래스: ${classList}`);

    // 클래스가 'usItemButtons usItemCartBuyButtons usNone'인지 확인
    if (classList.includes("usNone")) {
      if (isAvailable) {
        // 현재는 비활성화 상태지만 이전에 활성화 상태였던 경우
        isAvailable = false;
        console.log("구매 불가능 상태로 변경됨.");
      } else {
        console.log("아직 구입할 수 없습니다.");
      }
    } else {
      if (!isAvailable) {
        // 구매 가능 상태로 변경됨
        isAvailable = true;
        console.log("구입 가능 상태로 변경됨! 알림을 전송합니다.");

        // 텔레그램 메시지 전송
        const message = `구입 가능: ${URL}`;
        await bot.sendMessage(TELEGRAM_CHAT_ID, message);
        console.log("메시지를 성공적으로 보냈습니다.");
      } else {
        console.log("이미 구입 가능 상태입니다.");
      }
    }
  } catch (error) {
    console.error("에러 발생:", error);
  }
};

// 스케줄 설정: 매시간 0분에 실행
schedule.scheduleJob("0 * * * *", () => {
  console.log("페이지 상태를 확인합니다:", new Date().toLocaleString());
  checkAvailability();
});

// 프로그램 시작 시 즉시 실행
checkAvailability();
