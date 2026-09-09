// B-PSQI adapted sleep scoring (0-15 scale, 5 components)
// Based on the existing ASAF sleep.html implementation

export interface SleepAnswers {
  bedHour: number;
  bedMinute: number;
  bedAmPm: 'AM' | 'PM';
  wakeHour: number;
  wakeMinute: number;
  wakeAmPm: 'AM' | 'PM';
  latency: number; // minutes to fall asleep
  duration: number; // hours of actual sleep
  waking: number; // 0-3 frequency of waking up
  quality: number; // 0-3 subjective quality
}

export interface SleepResult {
  globalScore: number;
  components: {
    name: string;
    score: number;
    max: number;
  }[];
}

export function calculateSleepScore(answers: SleepAnswers): SleepResult {
  // Component 1: Subjective Sleep Quality (0-3)
  const comp1 = answers.quality;

  // Component 2: Sleep Latency (0-3)
  let comp2: number;
  if (answers.latency <= 15) comp2 = 0;
  else if (answers.latency <= 30) comp2 = 1;
  else if (answers.latency <= 60) comp2 = 2;
  else comp2 = 3;

  // Component 3: Sleep Duration (0-3)
  let comp3: number;
  if (answers.duration > 7) comp3 = 0;
  else if (answers.duration >= 6) comp3 = 1;
  else if (answers.duration >= 5) comp3 = 2;
  else comp3 = 3;

  // Component 4: Habitual Sleep Efficiency (0-3)
  let bedHour24 = answers.bedHour;
  if (answers.bedAmPm === 'PM' && answers.bedHour !== 12) bedHour24 += 12;
  if (answers.bedAmPm === 'AM' && answers.bedHour === 12) bedHour24 = 0;

  let wakeHour24 = answers.wakeHour;
  if (answers.wakeAmPm === 'PM' && answers.wakeHour !== 12) wakeHour24 += 12;
  if (answers.wakeAmPm === 'AM' && answers.wakeHour === 12) wakeHour24 = 0;

  let timeInBed: number;
  if (wakeHour24 > bedHour24) {
    timeInBed = (wakeHour24 - bedHour24) + (answers.wakeMinute - answers.bedMinute) / 60;
  } else {
    timeInBed = (24 - bedHour24 + wakeHour24) + (answers.wakeMinute - answers.bedMinute) / 60;
  }

  let comp4: number;
  if (timeInBed > 0) {
    const efficiency = (answers.duration / timeInBed) * 100;
    if (efficiency >= 85) comp4 = 0;
    else if (efficiency >= 75) comp4 = 1;
    else if (efficiency >= 65) comp4 = 2;
    else comp4 = 3;
  } else {
    comp4 = 0;
  }

  // Component 5: Sleep Disturbances (0-3)
  const comp5 = answers.waking;

  const globalScore = comp1 + comp2 + comp3 + comp4 + comp5;

  return {
    globalScore,
    components: [
      { name: 'Subjective Sleep Quality', score: comp1, max: 3 },
      { name: 'Sleep Latency', score: comp2, max: 3 },
      { name: 'Sleep Duration', score: comp3, max: 3 },
      { name: 'Habitual Sleep Efficiency', score: comp4, max: 3 },
      { name: 'Sleep Disturbances', score: comp5, max: 3 },
    ],
  };
}
