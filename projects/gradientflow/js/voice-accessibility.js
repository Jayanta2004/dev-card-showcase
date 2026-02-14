// Accessibility & Voice Control for GradientFlow
// Voice commands and screen reader support

export class VoiceController {
  constructor(onCommand) {
    this.onCommand = onCommand;
    this.active = false;
    this.recognition = null;
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new webkitSpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.onresult = (e) => {
        for (let i = 0; i < e.results.length; ++i) {
          if (e.results[i].isFinal) {
            let cmd = e.results[i][0].transcript.trim().toLowerCase();
            if (this.onCommand) this.onCommand(cmd);
          }
        }
      };
    }
  }
  start() {
    if (this.recognition) {
      this.recognition.start();
      this.active = true;
    }
  }
  stop() {
    if (this.recognition) {
      this.recognition.stop();
      this.active = false;
    }
  }
}
