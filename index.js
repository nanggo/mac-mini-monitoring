// index.js
import axios from "axios";
import { load } from "cheerio";
import TelegramBot from "node-telegram-bot-api";
import schedule from "node-schedule";
import dotenv from "dotenv";

dotenv.config();

// 텔레그램 봇 설정
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// 봇 초기화
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

// 프로그램 시작 시 텔레그램 알림 전송
bot
  .sendMessage(TELEGRAM_CHAT_ID, "모니터링 프로그램이 시작되었습니다.")
  .then(() => {
    console.log("스타트업 메시지를 성공적으로 보냈습니다.");
  })
  .catch((error) => {
    console.error("스타트업 메시지 전송 중 에러 발생:", error);
  });

// 모니터링할 URL
const URL = process.env.MONITOR_URL;

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
    const $ = load(html);

    // 특정 클래스가 있는 요소를 선택합니다.
    const button = $(".usItemButtons.usItemCartBuyButtons");

    if (button.length === 0) {
      console.log("버튼을 찾을 수 없습니다.");
      return;
    }

    const classList = button.attr("class");
    console.log(`현재 클래스: ${classList}`);

    const isAvailable = !button[0].classList.contains("usNone");

    if (isAvailable) {
      console.log("구입 가능 상태입니다! 알림을 전송합니다.");

      // 텔레그램 메시지 전송
      const message = `구입 가능: ${URL}`;
      await bot.sendMessage(TELEGRAM_CHAT_ID, message);
      console.log("메시지를 성공적으로 보냈습니다.");

      // 프로그램 종료
      process.exit(0);
    } else {
      console.log("구매 불가능 상태입니다.");
    }
  } catch (error) {
    console.error("에러 발생:", error);
  }
};

// 스케줄 설정: 매 5분마다 실행
schedule.scheduleJob("*/5 * * * *", () => {
  console.log("페이지 상태를 확인합니다:", new Date().toLocaleString());
  checkAvailability();
});

// 프로그램 시작 시 즉시 실행
checkAvailability();
