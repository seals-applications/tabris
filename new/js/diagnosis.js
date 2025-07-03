// グローバル変数としてanswersを定義
let answers = {
  carrier: null,
  wifi: null,
  price: null,
  dataUsage: null,
  members: null,
  satisfaction: null,
  needs: []
};

// 診断タイプを保持する変数をグローバルスコープで定義
let diagnosisType = '';

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
  // 保存された回答データを復元
  const savedAnswers = loadAnswers();
  if (savedAnswers) {
    answers = { ...answers, ...savedAnswers };
  }
  
  // 保存されたステップを確認
  const savedStep = getCurrentStep();
  if (savedStep > 1) {
    // 途中から再開する場合
    diagnosisType = savedStep <= 6 ? 'quick' : 'detailed';
    
    // 進捗バーを表示
    const progressTemplate = document.getElementById('progress-template');
    const progressElement = progressTemplate.content.cloneNode(true);
    document.body.appendChild(progressElement);
    
    // 進捗バーを更新
    updateProgressForStep(savedStep);
    
    // 現在のステップを表示
    setCurrentStep(savedStep);
    
    // スタート画面を非表示
    document.getElementById('startScreen').style.display = 'none';
  }
});

// 質問の定義
const questions = {
  carrier: {
    title: '現在のキャリアを教えてください',
    type: 'choice',
    choices: ['ドコモ', 'au', 'ソフトバンク', 'ワイモバイル']
  },
  wifi: {
    title: 'ネット回線をお持ちですか？',
    type: 'choice',
    choices: ['光回線', 'ケーブルテレビ', 'その他', 'なし']
  },
  price: {
    title: '現在の料金プランを教えてください',
    type: 'number',
    placeholder: '月額料金（円）'
  },
  dataUsage: {
    title: '月間の使用データ量を教えてください',
    type: 'choice',
    choices: ['0～1GB', '1～4GB', '4～10GB', '10～30GB', '30～50GB', '50GB以上']
  },
  members: {
    title: '家族の人数を教えてください',
    type: 'number',
    placeholder: '家族人数（1～10人）'
  },
  satisfaction: {
    title: '現在の料金プランに満足していますか？',
    type: 'choice',
    choices: ['とても満足', '満足', '普通', '不満', 'とても不満']
  },
  // 3分診断用の追加質問
  callTime: {
    title: '1日の平均通話時間を教えてください',
    type: 'choice',
    choices: ['ほとんどなし', '5分未満', '5～15分', '15～30分', '30分以上']
  },
  location: {
    title: '主な利用場所を教えてください',
    type: 'choice',
    choices: ['自宅', '会社・学校', '外出先', 'その他']
  },
  apps: {
    title: 'よく使うアプリを教えてください',
    type: 'multi-choice',
    choices: ['LINE', 'Twitter', 'Instagram', 'Facebook', 'YouTube', 'TikTok', 'オンラインゲーム', '地図アプリ', '特になし']
  },
  contract: {
    title: '契約期間を教えてください',
    type: 'choice',
    choices: ['1年未満', '1～2年', '2～3年', '3年以上']
  },
  payment: {
    title: '端末の支払い方法を教えてください',
    type: 'choice',
    choices: ['一括払い', '分割払い', '端末代なし']
  }
};

// 質問画面を表示する関数
function showQuestion(questionId) {
  const question = questions[questionId];
  const container = document.querySelector('.container');
  
  // 既存の質問画面を非表示
  document.querySelectorAll('.question-screen').forEach(screen => {
    screen.style.display = 'none';
  });
  
  // 既存の進捗バーを削除
  const existingProgress = document.querySelector('.progress-container');
  if (existingProgress) {
    existingProgress.remove();
  }
  
  let questionElement;
  
  switch (question.type) {
    case 'choice':
      questionElement = createChoiceQuestion(
        question.title,
        question.choices,
        value => setAnswer(questionId, value)
      );
      break;
      
    case 'number':
      questionElement = createNumberInputQuestion(
        question.title,
        question.placeholder,
        value => setAnswer(questionId, value)
      );
      break;
      
    case 'multi-choice':
      questionElement = createMultiChoiceQuestion(
        question.title,
        question.choices,
        value => setAnswer(questionId, value)
      );
      break;
  }
  
  // 進捗バーを作成して表示
  const progressTemplate = document.getElementById('progress-template');
  const progressElement = progressTemplate.content.cloneNode(true);
  document.body.appendChild(progressElement);
  
  // 進捗バーを更新
  updateProgress(questionId);
  
  container.appendChild(questionElement);
  questionElement.style.display = 'block';
}

// 進捗バーを更新する関数
function updateProgress(questionId) {
  const questionKeys = Object.keys(questions);
  const currentIndex = questionKeys.indexOf(questionId);
  const totalQuestions = diagnosisType === 'quick' ? 6 : 11;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  
  // 進捗バーの幅を更新
  const progressFill = document.querySelector('.progress-fill');
  if (progressFill) {
    progressFill.style.width = `${progress}%`;
  }
  
  // 質問番号を更新
  const currentStep = document.querySelector('.current-step');
  const totalSteps = document.querySelector('.total-steps');
  if (currentStep && totalSteps) {
    currentStep.textContent = currentIndex + 1;
    totalSteps.textContent = totalQuestions;
  }
}

// 1分診断を開始する関数
function startQuickDiagnosis() {
  // 診断タイプを設定
  diagnosisType = 'quick';
  
  // すべての画面を非表示にする
  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('result').style.display = 'none';
  
  // 質問画面をすべて非表示にする
  for (let i = 1; i <= 11; i++) {
    document.getElementById(`step${i}`).style.display = 'none';
  }
  
  // 1問目の質問のみを表示
  document.getElementById('step1').style.display = 'block';
  
  // 現在のステップを1に設定
  setCurrentStep(1);
  
  // 既存の進捗バーを削除
  const existingProgress = document.querySelector('.progress-container');
  if (existingProgress) {
    existingProgress.remove();
  }
  
  // 進捗バーを表示
  const progressTemplate = document.getElementById('progress-template');
  const progressElement = progressTemplate.content.cloneNode(true);
  document.body.appendChild(progressElement);
  
  // 進捗バーを更新（1分診断は6問）
  updateProgressForStep(1);
  
  // 回答をリセット
  answers = {
    carrier: '',
    wifi: '',
    price: '',
    dataUsage: '',
    members: '',
    satisfaction: '',
    needs: []
  };
}

// 3分診断を開始する関数
function startDetailedDiagnosis() {
  // 診断タイプを設定
  diagnosisType = 'detailed';
  
  // すべての画面を非表示にする
  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('result').style.display = 'none';
  
  // 質問画面をすべて非表示にする
  for (let i = 1; i <= 11; i++) {
    document.getElementById(`step${i}`).style.display = 'none';
  }
  
  // 1問目の質問のみを表示
  document.getElementById('step1').style.display = 'block';
  
  // 現在のステップを1に設定
  setCurrentStep(1);
  
  // 既存の進捗バーを削除
  const existingProgress = document.querySelector('.progress-container');
  if (existingProgress) {
    existingProgress.remove();
  }
  
  // 進捗バーを表示
  const progressTemplate = document.getElementById('progress-template');
  const progressElement = progressTemplate.content.cloneNode(true);
  document.body.appendChild(progressElement);
  
  // 進捗バーを更新（3分診断は11問）
  updateProgressForStep(1);
  
  // 回答をリセット
  answers = {
    carrier: '',
    wifi: '',
    price: '',
    dataUsage: '',
    members: '',
    satisfaction: '',
    needs: [],
    callTime: '',
    location: '',
    apps: [],
    contract: '',
    payment: ''
  };
}

// 次のステップに進む
function nextStep() {
  const currentStep = getCurrentStep();
  const nextStepNum = currentStep + 1;
  
  // 現在のステップを非表示
  document.getElementById(`step${currentStep}`).style.display = 'none';
  
  // 次のステップを表示
  if (document.getElementById(`step${nextStepNum}`)) {
    document.getElementById(`step${nextStepNum}`).style.display = 'block';
    setCurrentStep(nextStepNum);
    
    // 進捗バーを更新
    updateProgressForStep(nextStepNum);
    
    // 途中保存
    saveDraft(answers, nextStepNum);
  } else {
    // 最後のステップの場合
    showResult();
  }
}

// 前のステップに戻る
function goBack(step) {
  // 現在のステップを非表示
  document.getElementById(`step${step + 1}`).style.display = 'none';
  
  // 前のステップを表示
  document.getElementById(`step${step}`).style.display = 'block';
  setCurrentStep(step);
  
  // 進捗バーを更新
  updateProgressForStep(step);
  
  // 途中保存
  saveDraft(answers, step);
}

// ステップ番号に基づいて進捗バーを更新する関数
function updateProgressForStep(stepNumber) {
  const totalQuestions = diagnosisType === 'quick' ? 6 : 11;
  const progress = (stepNumber / totalQuestions) * 100;
  
  // 進捗バーの幅を更新
  const progressFill = document.querySelector('.progress-fill');
  if (progressFill) {
    progressFill.style.width = `${progress}%`;
    console.log(`進捗バー更新: ${stepNumber}/${totalQuestions} (${progress}%)`);
  } else {
    console.warn('進捗バーの要素が見つかりません');
  }
  
  // 質問番号を更新
  const currentStep = document.querySelector('.current-step');
  const totalSteps = document.querySelector('.total-steps');
  if (currentStep && totalSteps) {
    currentStep.textContent = stepNumber;
    totalSteps.textContent = totalQuestions;
    console.log(`質問番号更新: ${stepNumber}/${totalQuestions}`);
  } else {
    console.warn('質問番号の要素が見つかりません');
  }
}

// 回答を設定する関数
function setAnswer(key, value) {
  answers[key] = value;
  
  // 回答を保存
  saveAnswers(answers);
  
  // 最後のステップでない場合は次のステップへ
  const currentStep = getCurrentStep();
  if (currentStep < 11 || diagnosisType === 'quick') {
    nextStep();
  } else if (currentStep === 11 && diagnosisType === 'detailed') {
    // 3分診断の最後のステップの場合は自動遷移しない
    // 診断結果を見るボタンを表示
    const resultButton = document.querySelector('#step11 .cta-button');
    if (resultButton) {
      resultButton.style.display = 'block';
    }
  }
}

// 満足度を設定する関数
function setSatisfaction(btn, value) {
  // 他のボタンの選択を解除
  btn.parentElement.querySelectorAll('button').forEach(button => {
    button.style.background = DEFAULT_BUTTON_COLOR;
  });
  
  // 選択したボタンをハイライト
  btn.style.background = SELECTED_BUTTON_COLOR;
  
  // 満足度を保存
  answers.satisfaction = value;
  
  // 診断タイプに応じて処理を分岐
  if (diagnosisType === 'quick') {
    // 1分診断の場合
    const resultButton = document.querySelector('#step6 .cta-button');
    const nextButton = document.querySelector('#step6 .next-button');
    resultButton.style.display = 'block';
    if (nextButton) nextButton.style.display = 'none';
  } else {
    // 3分診断の場合は自動的に次の質問へ
    nextStep();
  }
}

// ステップ6のボタン表示を更新する関数
function updateStep6Buttons() {
  const resultButton = document.querySelector('#step6 .cta-button');
  const nextButton = document.querySelector('#step6 .next-button');
  
  if (diagnosisType === 'quick') {
    // 1分診断の場合
    resultButton.style.display = 'block';
    if (nextButton) nextButton.style.display = 'none';
  } else {
    // 3分診断の場合は「次へ」ボタンを非表示
    resultButton.style.display = 'none';
    if (nextButton) nextButton.style.display = 'none';
  }
}

// アプリの選択を切り替える関数
function toggleApp(btn, value) {
  if (!answers.apps) {
    answers.apps = [];
  }

  if (value === '特になし') {
    // 「特になし」が選択された場合
    answers.apps = ['特になし'];
    // すべてのボタンの背景色をリセット
    btn.parentElement.querySelectorAll('button').forEach(button => {
      button.style.background = DEFAULT_BUTTON_COLOR;
    });
    btn.style.background = SELECTED_BUTTON_COLOR;
  } else {
    // その他のアプリが選択された場合
    // 「特になし」を選択リストから削除
    answers.apps = answers.apps.filter(v => v !== '特になし');
    // 「特になし」ボタンの背景色をリセット
    const noneButton = btn.parentElement.querySelector('button:last-child');
    noneButton.style.background = DEFAULT_BUTTON_COLOR;
    
    if (answers.apps.includes(value)) {
      // 選択解除
      answers.apps = answers.apps.filter(v => v !== value);
      btn.style.background = DEFAULT_BUTTON_COLOR;
    } else {
      // 選択
      answers.apps.push(value);
      btn.style.background = SELECTED_BUTTON_COLOR;
    }
  }
}

// 要望を切り替える関数
function toggleNeed(btn, value) {
  if (value === '特になし') {
    // 「特になし」が選択された場合
    answers.needs = ['特になし'];
    // すべてのボタンの背景色をリセット
    btn.parentElement.querySelectorAll('button').forEach(button => {
      button.style.background = DEFAULT_BUTTON_COLOR;
    });
    btn.style.background = SELECTED_BUTTON_COLOR;
  } else {
    // その他の要望が選択された場合
    answers.needs = answers.needs.filter(v => v !== '特になし');
    const noneButton = btn.parentElement.querySelector('button:last-child');
    resetButtonStyle(noneButton);
    
    if (answers.needs.includes(value)) {
      answers.needs = answers.needs.filter(v => v !== value);
      resetButtonStyle(btn);
    } else {
      answers.needs.push(value);
      setSelectedStyle(btn);
    }
  }

  // 診断タイプに応じてボタンの表示を更新
  updateStep6Buttons();
}

// 1分診断の結果計算
function calculateResult() {
  const { carrier, wifi, price, members, dataUsage, satisfaction } = answers;

  // 現在の支払額は入力された価格をそのまま使用
  const currentPrice = price;
  
  // 使用ギガ数に応じた推奨プランと最安値を設定
  let recommendedPlans = []; // 推奨プランを配列で管理

  if (dataUsage === '0～1GB' || dataUsage === '1～4GB') {
    recommendedPlans.push({
      data: '4GB/月',
      price: '1,078～2,365円/月',
      minPrice: 1078
    });
  } else if (dataUsage === '4～10GB') {
    recommendedPlans.push({
      data: '30GB/月',
      price: '2,178～4,015円/月',
      minPrice: 2178
    });
  } else if (dataUsage === '10～30GB') {
    // 10～30GBの場合は2つのプランを提案
    recommendedPlans.push({
      data: '35GB/月',
      price: '3,278～5,115円/月',
      minPrice: 3278
    });
    recommendedPlans.push({
      data: '30GB/月',
      price: '2,178～4,015円/月',
      minPrice: 2178
    });
    
    // 最低料金で昇順ソート
    recommendedPlans.sort((a, b) => a.minPrice - b.minPrice);
  } else if (dataUsage === '30～50GB' || dataUsage === '50GB以上') {
    recommendedPlans.push({
      data: 'ギガ無制限',
      price: '4,928～7,425円/月',
      minPrice: 4928
    });
  }

  // 結果表示
  displayResults(recommendedPlans);
}

// 3分診断の結果計算
function calculateDetailedResult() {
  const { carrier, wifi, price, members, dataUsage, callTime, location, apps, contract, payment } = answers;

  // 既存の計算ロジックを拡張
  let recommendedPlans = [];
  
  // 通話時間による追加判定
  const isHighCallUsage = callTime === '30分以上' || callTime === '15～30分';
  
  // アプリ使用による追加判定
  const isHighDataApp = apps && (apps.includes('YouTube') || apps.includes('TikTok') || apps.includes('オンラインゲーム'));
  
  // 契約期間による追加判定
  const isLongContract = contract === '3年以上' || contract === '2～3年';

  // 既存の推奨プラン判定ロジックに加えて、詳細な条件を追加
  if (dataUsage === '0～1GB' || dataUsage === '1～4GB') {
    // 低データ使用量の場合の処理
    recommendedPlans.push({
      data: '4GB/月',
      price: '1,078～2,365円/月',
      minPrice: 1078
    });
  }
  // ... 他のプラン判定ロジック ...

  // 追加情報の表示
  const additionalInfo = [];
  if (isHighCallUsage) {
    additionalInfo.push('通話オプションの追加がおすすめです');
  }
  if (isHighDataApp) {
    additionalInfo.push('動画・ゲーム使用が多いため、大容量プランをおすすめします');
  }
  if (isLongContract) {
    additionalInfo.push('長期契約特典が適用される可能性があります');
  }

  // 結果表示
  displayResults(recommendedPlans, additionalInfo);
}

// 結果表示関数
function displayResults(recommendedPlans, additionalInfo = []) {
  // 既存の結果表示ロジック
  const { carrier, wifi, price, members, dataUsage, satisfaction, callTime, location, apps, contract, payment } = answers;
  const currentPrice = price;
  const lowestPrice = Math.min(...recommendedPlans.map(plan => plan.minPrice));
  const monthlySavings = Math.max(0, currentPrice - lowestPrice);
  const annualSavings = monthlySavings * 12;
  const formattedSavings = annualSavings.toLocaleString();
  const savingsAmountSpan = `<span style="font-size: 1.4em; font-weight: bold; color: #e60012;">${formattedSavings}</span>`;
  const savingsText = annualSavings > 10000 
    ? `年間で${savingsAmountSpan}円も安くなる可能性があります！`
    : `年間で${savingsAmountSpan}円安くなる可能性があります！`;

  // 進捗バーを非表示
  const progressBar = document.querySelector('.progress-container');
  if (progressBar) {
    progressBar.remove();
  }

  document.getElementById('resultText').innerHTML = savingsText;
  const isCashbackEligible = carrier !== 'ソフトバンク' && carrier !== 'ワイモバイル';
  document.getElementById('cashbackText').innerHTML = isCashbackEligible ? 
    '<span style="color: #ff0000; font-weight: bold;">キャッシュバック対象のお客様です！スタッフにお尋ねください！</span>' : 
    '';

  document.querySelectorAll('.container > div:not(#result)').forEach(div => div.style.display = 'none');
  document.getElementById('result').style.display = 'block';
  document.getElementById('historyMenu').classList.remove('show');
  document.getElementById('carrierAnswer').innerHTML = `現在のキャリア: ${carrier}`;
  document.getElementById('wifiAnswer').innerHTML = `ネット回線: ${wifi}`;
  document.getElementById('priceAnswer').innerHTML = `現在の料金プラン: ${price}円/月`;
  document.getElementById('dataUsageAnswer').innerHTML = `使用データ量: ${dataUsage}`;
  document.getElementById('membersAnswer').innerHTML = `家族人数: ${members}人`;
  document.getElementById('satisfactionAnswer').innerHTML = `満足度: ${satisfaction}%`;
  
  // 1分診断の場合は質問7以降の回答を非表示にする
  if (diagnosisType === 'quick') {
    document.getElementById('callTimeAnswer').style.display = 'none';
    document.getElementById('locationAnswer').style.display = 'none';
    document.getElementById('appsAnswer').style.display = 'none';
    document.getElementById('contractAnswer').style.display = 'none';
    document.getElementById('paymentAnswer').style.display = 'none';
  } else {
    // 3分診断の場合は全ての回答を表示
    document.getElementById('callTimeAnswer').style.display = 'block';
    document.getElementById('locationAnswer').style.display = 'block';
    document.getElementById('appsAnswer').style.display = 'block';
    document.getElementById('contractAnswer').style.display = 'block';
    document.getElementById('paymentAnswer').style.display = 'block';
    
    // 3分診断の場合は質問7以降の回答内容を設定
    document.getElementById('callTimeAnswer').innerHTML = `1日の平均通話時間: ${callTime}`;
    document.getElementById('locationAnswer').innerHTML = `主な利用場所: ${location}`;
    document.getElementById('appsAnswer').innerHTML = `よく使うアプリ: ${apps ? apps.join(', ') : '特になし'}`;
    document.getElementById('contractAnswer').innerHTML = `契約期間: ${contract}`;
    document.getElementById('paymentAnswer').innerHTML = `端末の支払い方法: ${payment}`;
  }
  
  let planHtml = '';
  recommendedPlans.forEach((plan, index) => {
    const planTitle = recommendedPlans.length > 1 ? `おすすめプラン${index + 1}` : '';
    planHtml += `
      <div style="padding: 15px; background-color: #f8f9fa; border-radius: 5px; ${index > 0 ? 'margin-top: 15px;' : ''}">
        ${planTitle ? `<p style="font-weight: bold; margin-bottom: 5px;">${planTitle}</p>` : ''}
        <p style="margin: 0;">データ容量: ${plan.data}</p>
        <p style="margin: 0;">月額料金: ${plan.price}</p>
      </div>
    `;
  });

  document.getElementById('planRecommendation').innerHTML = planHtml;
  
  // 診断結果をSupabaseに保存
  saveDiagnosisResult(recommendedPlans, additionalInfo);
  
  // 追加情報の表示
  if (additionalInfo.length > 0) {
    const additionalHtml = `
      <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
        <h3 style="margin-bottom: 10px;">追加アドバイス</h3>
        <ul style="margin: 0; padding-left: 20px;">
          ${additionalInfo.map(info => `<li>${info}</li>`).join('')}
        </ul>
      </div>
    `;
    document.getElementById('planRecommendation').insertAdjacentHTML('beforeend', additionalHtml);
  }
}

// TOPに戻る関数
function goToTop() {
  // すべての選択をリセット
  answers = {};
  diagnosisType = '';
  
  // 保存されたデータをクリア
  clearData(STORAGE_KEYS.ANSWERS);
  clearData(STORAGE_KEYS.CURRENT_STEP);
  
  // すべてのボタンの背景色をリセット
  document.querySelectorAll('.input-box button').forEach(button => {
    button.style.background = '#4a90e2';
  });
  
  // 進捗バーを削除
  const progressBar = document.querySelector('.progress-container');
  if (progressBar) {
    progressBar.remove();
  }
  
  // すべての画面を非表示にし、スタート画面のみ表示
  document.querySelectorAll('.container > div').forEach(div => {
    div.style.display = 'none';
  });
  document.getElementById('startScreen').style.display = 'block';
  
  // 履歴メニューを閉じる
  document.getElementById('historyMenu').classList.remove('show');
  
  // 結果画面を非表示
  document.getElementById('result').style.display = 'none';
}

// ステップ11のボタン表示を更新する関数
function updateStep11Buttons() {
  const resultButton = document.querySelector('#step11 .cta-button');
  const nextButton = document.querySelector('#step11 .next-button');
  
  if (resultButton) {
    resultButton.style.display = 'block';
  }
  if (nextButton) {
    nextButton.style.display = 'none';
  }
}

// 支払い方法を設定する関数
function setPayment(btn, value) {
  // 他のボタンの選択を解除
  btn.parentElement.querySelectorAll('button').forEach(button => {
    button.style.background = DEFAULT_BUTTON_COLOR;
  });
  
  // 選択したボタンをハイライト
  btn.style.background = SELECTED_BUTTON_COLOR;
  
  // 支払い方法を保存
  answers.payment = value;
  
  // 診断結果を見るボタンを表示
  const resultButton = document.querySelector('#step11 .cta-button');
  if (resultButton) {
    resultButton.style.display = 'block';
  }
}

// 3分診断の結果を表示する関数
function showDetailedResult() {
  // 最後の質問の回答が選択されているか確認
  if (!answers.payment) {
    alert('支払い方法を選択してください。');
    return;
  }
  calculateDetailedResult();
}

// 結果を表示
function showResult() {
  // 途中保存をクリア
  clearDraft();
  
  // 履歴に保存
  saveToHistory();
  
  // 結果画面を表示
  document.getElementById('result').style.display = 'block';
  
  // 結果を表示
  displayResult();
}

// 診断結果をSupabaseに保存する関数
async function saveDiagnosisResult(recommendedPlans, additionalInfo = []) {
  try {
    const { carrier, wifi, price, members, dataUsage, satisfaction, callTime, location, apps, contract, payment } = answers;
    
    // 保存するデータを準備
    const diagnosisData = {
      diagnosis_type: diagnosisType,
      carrier: carrier,
      wifi: wifi,
      price: price,
      data_usage: dataUsage,
      members: members,
      satisfaction: satisfaction,
      call_time: callTime,
      location: location,
      apps: apps,
      contract: contract,
      payment: payment,
      recommended_plans: recommendedPlans,
      cashback_amount: calculateCashbackAmount(carrier, price),
      additional_info: additionalInfo || []
    };

    // Supabaseに保存
    const savedResult = await saveDiagnosisHistory(diagnosisData);
    
    if (savedResult) {
      console.log('診断結果が保存されました:', savedResult);
      
      // 家族メンバー情報がある場合は保存
      if (window.familyMembers && window.familyMembers.length > 0) {
        await saveFamilyMembers(savedResult.id, window.familyMembers);
      }
    } else {
      console.warn('診断結果の保存に失敗しました');
    }
  } catch (error) {
    console.error('診断結果の保存中にエラーが発生:', error);
  }
}

// キャッシュバック金額を計算する関数
function calculateCashbackAmount(carrier, currentPrice) {
  // ソフトバンク・ワイモバイル以外でキャッシュバック対象
  if (carrier === 'ソフトバンク' || carrier === 'ワイモバイル') {
    return 0;
  }
  
  // 料金に応じたキャッシュバック金額を計算
  if (currentPrice >= 5000) {
    return 5000;
  } else if (currentPrice >= 3000) {
    return 3000;
  } else if (currentPrice >= 2000) {
    return 2000;
  } else {
    return 1000;
  }
}

