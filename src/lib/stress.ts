// Perceived Stress Scale (PSS-4) - as per Google Form
// 4 questions, each scored 0-4
// Questions 2 & 3 are REVERSE scored
// Total score: 0-16

export interface StressAnswers {
  q1: number; // UNABLE to control important things
  q2: number; // CONFIDENT about handling personal problems (REVERSE)
  q3: number; // Things were going your way (REVERSE)
  q4: number; // Difficulties piling up
}

export const stressQuestions = [
  {
    id: 'q1',
    en: 'In the last month, how often have you felt that you were UNABLE to control the important things in your life?',
    hi: 'पिछले एक महीने में, आपको कितनी बार ऐसा लगा कि आपके जीवन की महत्वपूर्ण बातें आपके नियंत्रण से बाहर हैं?',
    reverseScored: false,
  },
  {
    id: 'q2',
    en: 'In the last month, how often have you felt CONFIDENT about your ability to handle personal problems?',
    hi: 'पिछले एक महीने में, आपको कितनी बार यह भरोसा था कि आप अपनी व्यक्तिगत (निजी) समस्याओं को अच्छी तरह संभाल सकते हैं?',
    reverseScored: true,
  },
  {
    id: 'q3',
    en: 'In the last month, how often have you felt that things were going your way?',
    hi: 'पिछले एक महीने में, आपको कितनी बार ऐसा लगा कि चीज़ें आपके मनचाहे तरीके से चल रही थीं?',
    reverseScored: true,
  },
  {
    id: 'q4',
    en: 'In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?',
    hi: 'पिछले एक महीने में, आपको कितनी बार लगा कि आपकी परेशानियाँ इतनी बढ़ गई हैं कि आप उन्हें संभाल नहीं पा रहे थे/रही थीं?',
    reverseScored: false,
  },
];

export const stressOptions = [
  { value: 0, en: 'Never', hi: 'कभी नहीं' },
  { value: 1, en: 'Almost never', hi: 'लगभग कभी नहीं' },
  { value: 2, en: 'Sometimes', hi: 'कभी-कभी' },
  { value: 3, en: 'Fairly often', hi: 'अक्सर' },
  { value: 4, en: 'Very often', hi: 'बहुत अधिक बार' },
];

export function calculateStressScore(answers: StressAnswers): number {
  // Q2 and Q3 are reverse scored: 0->4, 1->3, 2->2, 3->1, 4->0
  const q2Score = 4 - answers.q2;
  const q3Score = 4 - answers.q3;
  return answers.q1 + q2Score + q3Score + answers.q4;
}
