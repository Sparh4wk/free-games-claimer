import { chromium, devices } from "patchright";
import crypto from 'crypto';


// Login information obtained from Docker environment variables
const LOGIN_EMAIL_ADDRSS = process.env.MS_EMAIL || "MY_EMAIL_ADDRESS";
const LOGIN_PASSWORD = process.env.MS_PASSWORD || "MY_PASSWORD";
const TOTP_SECRET = process.env.MS_TOTP_SECRET || "YOUR_TOTP_SECRET_HERE";


// Environment variable confirmation log
console.log(`Email: ${LOGIN_EMAIL_ADDRSS}`);
console.log(`Password: ${LOGIN_PASSWORD ? '[SET]' : '[NOT SET]'}`);
console.log(`TOTP Secret: ${TOTP_SECRET && TOTP_SECRET !== "YOUR_TOTP_SECRET_HERE" ? '[SET]' : '[NOT SET]'}`);


// TOTP settings (for 2FA)
const TOTP_WINDOW = 1; // Time drift tolerance range


// Other settings
const BROWSER_USER_DIR = "/root/free-games-claimer/data/browser";
const BING_REWARDS_URL = "https://rewards.bing.com";
const BING_URL = "https://www.bing.com";
const BING_REWARDS_ACTIVITY_CARD_SELECTOR = "mee-card:has(.mee-icon-AddMedium)";


const BING_SEARCH_TERMS = [
  // Language
  [
    [
      "translate", "how to pronounce", "common phrases in", "language tips for",
      "how do you say", "learn", "language learning resources for"
    ],
    [
      "french", "german", "spanish", "japanese", "mandarin", "italian", "korean"
    ]
  ],
  // Cooking and Restaurant
  [
    [
      "best recipe for", "how to cook", "nutritional facts about", "substitute for",
      "top rated", "make at home", "how long to bake"
    ],
    [
      "lasagna", "banana bread", "sushi rice", "tofu stir fry",
      "cauliflower pizza", "homemade hummus"
    ]
  ],
  // Health
  [
    [
      "symptoms of", "natural cure for", "best treatment for", "how to prevent",
      "is it healthy to", "how often should I", "side effects of"
    ],
    [
      "insomnia", "acid reflux", "depression", "iron deficiency",
      "high blood pressure", "intermittent fasting", "yoga"
    ]
  ],
  // Productivity and self-help
  [
    [
      "increase productivity with", "benefits of", "how to start", "top tips for",
      "common mistakes in", "how to build a habit for"
    ],
    [
      "journaling", "minimalism", "Pomodoro technique", "goal setting",
      "daily planning", "habit tracking"
    ]
  ],
  // Shopping
  [
    [
      "affordable", "best rated", "latest deals on", "compare prices of",
      "should I buy", "value for money", "review of"
    ],
    [
      "wireless earbuds", "gaming laptops", "air purifiers", "LED lamps",
      "blenders", "ergonomic chairs"
    ]
  ],
  // Travel
  [
    [
      "best time to travel to", "things to do in", "underrated places in",
      "weekend trip to", "travel safety tips for", "visa requirement for"
    ],
    [
      "canada", "bali", "portugal", "copenhagen",
      "thailand", "dubai", "iceland"
    ]
  ],
  // Finance
  [
    [
      "current value of", "investment tips for", "what affects", "how to save on",
      "economic forecast for", "trading strategy for"
    ],
    [
      "bitcoin", "retirement fund", "mortgage rates", "real estate",
      "tesla stock", "gold price"
    ]
  ],
  // Sports
  [
    [
      "who won", "match highlights", "how to watch", "scoreboard",
      "player of the year", "injury update for"
    ],
    [
      "nba finals", "wimbledon", "mlb", "nfl draft",
      "olympics", "world cup", "tour de france"
    ]
  ],
  // Weather
  [
    [
      "weather this weekend in", "extended forecast for", "UV index in",
      "pollen count in", "air quality in", "sunset time in"
    ],
    [
      "seattle", "barcelona", "new delhi", "tokyo",
      "moscow", "rio de janeiro", "cape town"
    ]
  ],
  // Technology
  [
    [
      "latest update on", "troubleshooting", "how to install", "introduction to",
      "best tools for", "future of"
    ],
    [
      "artificial intelligence", "linux", "blockchain", "augmented reality",
      "typescript", "cloud computing", "flutter"
    ]
  ],
  // History and Culture
  [
    [
      "historical events in", "famous landmarks of", "cultural traditions in",
      "museum exhibits about", "origin of", "impact of"
    ],
    [
      "ancient rome", "renaissance period", "world war 2", "maya civilization",
      "victorian era", "industrial revolution", "ottoman empire"
    ]
  ],
  // Nature and Environment
  [
    [
      "endangered species in", "climate change effects on", "wildlife facts about",
      "how to protect", "rainforest importance", "renewable energy in"
    ],
    [
      "amazon rainforest", "antarctica", "australia", "sahara desert",
      "pacific ocean", "arctic circle", "mount everest"
    ]
  ],
  // Hobbies and Lifestyle
  [
    [
      "how to get started with", "tips for beginners in", "benefits of learning",
      "advanced techniques in", "popular equipment for", "communities for"
    ],
    [
      "photography", "woodworking", "birdwatching", "model trains",
      "fishing", "gardening", "3d printing"
    ]
  ],
  // Careers and Jobs
  [
    [
      "skills required for", "day in the life of", "best certifications for",
      "remote jobs in", "freelancing tips for", "interview questions for"
    ],
    [
      "cybersecurity analyst", "product manager", "graphic designer",
      "software engineer", "data scientist", "UX researcher"
    ]
  ],
  // Music
  [
    [
      "lyrics of", "meaning behind", "release date of", "music video for",
      "who wrote", "chords for", "top songs by"
    ],
    [
      "bohemian rhapsody", "shape of you", "blinding lights", "bad guy",
      "drivers license", "hotel california", "take me to church"
    ]
  ],
  // Movies
  [
    [
      "plot summary of", "cast of", "release year of", "awards won by",
      "director of", "soundtrack of", "where to stream"
    ],
    [
      "inception", "the godfather", "parasite", "pulp fiction",
      "avengers endgame", "la la land", "everything everywhere all at once"
    ]
  ],
  // Games
  [
    [
      "walkthrough for", "review of", "release date of", "multiplayer mode in",
      "system requirements for", "how to mod", "top tips for"
    ],
    [
      "zelda breath of the wild", "elden ring", "minecraft", "cyberpunk 2077",
      "the witcher 3", "fortnite", "starfield"
    ]
  ],
  // Books
  [
    [
      "summary of", "author of", "genre of", "awards won by",
      "sequel to", "publication year of", "characters in"
    ],
    [
      "to kill a mockingbird", "1984", "the great gatsby", "harry potter and the sorcerer's stone",
      "the catcher in the rye", "pride and prejudice", "the hobbit"
    ]
  ],
  //Vocabulary
  [
    [
      "meaning of", "definition of", "how to use", "examples of",
      "what does it mean", "synonyms of", "antonyms of"
    ],
    [
      "ephemeral", "ubiquitous", "serendipity", "catharsis",
      "dichotomy", "paradox", "juxtaposition"
    ]
  ],
  // Time Zones
  [
    [
      "current time in", "what time is it in", "time difference with",
      "date and time in", "timezone of", "is it day or night in"
    ],
    [
      "tokyo", "new york", "london", "sydney",
      "dubai", "moscow", "cape town", "beijing"
    ]
  ],
].map(category => category[0].flatMap(a1 => category[1].map(a2 => `${a1} ${a2}`)));


// Log settings
const originalLog = console.log;
console.log = (...args) => {
  const timestamp = new Date().toISOString();
  originalLog(`[${timestamp}]`, ...args);
};


// RFC6238-compliant Base32 decode function (modified version)
function base32Decode(encoded) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const bits = [];
  const output = [];
  
  // Remove padding characters and convert to uppercase
  encoded = encoded.replace(/=+$/, '').toUpperCase();
  
  // Convert each character to 5 bits
  for (let i = 0; i < encoded.length; i++) {
    const val = alphabet.indexOf(encoded[i]);
    if (val === -1) continue;
    
    // Add 5 bits
    for (let j = 4; j >= 0; j--) {
      bits.push((val >>> j) & 1);
    }
  }
  
  // Extract 8 bits at a time and convert to bytes
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) {
      byte = (byte << 1) | bits[i + j];
    }
    output.push(byte);
  }
  
  return Buffer.from(output);
}


// RFC6238-compliant TOTP generation function (modified version)
function generateTOTP(secret, timeStep = 30, digits = 6) {
  const key = base32Decode(secret);
  const epoch = Math.floor(Date.now() / 1000);
  const counter = Math.floor(epoch / timeStep);
  
  // Convert counter to 8-byte big-endian
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  counterBuffer.writeUInt32BE(counter & 0xffffffff, 4);
  
  // HMAC-SHA1 calculation
  const hmac = crypto.createHmac('sha1', key);
  hmac.update(counterBuffer);
  const hash = hmac.digest();
  
  // RFC6238 Dynamic Truncation
  const offset = hash[hash.length - 1] & 0x0f;
  const code = ((hash[offset] & 0x7f) << 24) |
               ((hash[offset + 1] & 0xff) << 16) |
               ((hash[offset + 2] & 0xff) << 8) |
               (hash[offset + 3] & 0xff);
  
  const otp = code % Math.pow(10, digits);
  return otp.toString().padStart(digits, '0');
}


// 2FA processing function (specialized for image form pattern)
async function handle2FA(page) {
  try {
    console.log("=== 2FA Detection Starting ===");
    
    // Wait sufficiently for screen transition
    await page.waitForTimeout(8000);
    
    console.log(`Current URL: ${page.url()}`);
    console.log(`Page title: ${await page.title()}`);
    
    // 2FA screen detection
    let twoFADetected = false;
    
    // Detection methods specific to image pattern
    const detectionMethods = [
      // Text detection
      () => page.locator("text=Enter the code generated by your authenticator app").isVisible(),
      () => page.locator("text=Enter code").isVisible(),
      () => page.locator("text=Use an app").isVisible(),
      // Label detection
      () => page.locator("label:has-text('Code')").isVisible(),
      () => page.locator("text=Code").isVisible(),
      // URL pattern
      () => page.url().includes('proofs') || page.url().includes('mfa') || page.url().includes('verification')
    ];
    
    for (let attempt = 0; attempt < 10; attempt++) {
      console.log(`2FA detection attempt ${attempt + 1}/10...`);
      
      for (const method of detectionMethods) {
        try {
          if (await method()) {
            console.log("2FA screen detected!");
            twoFADetected = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (twoFADetected) break;
      await page.waitForTimeout(2000);
    }
    
    if (!twoFADetected) {
      console.log("No 2FA screen detected");
      return;
    }
    
    // Identify input field for image pattern
    console.log("=== Locating input field ===");
    let totpInput = null;
    
    // Selectors specific to image pattern
    const specificSelectors = [
      // Input field near "Code" label
      'label:has-text("Code") + input',
      'label:has-text("Code") ~ input',
      'div:has(label:has-text("Code")) input',
      
      // Association via aria-labelledby
      'input[aria-labelledby*="code"]',
      'input[aria-labelledby*="Code"]',
      
      // General patterns
      'input[aria-label*="Code"]',
      'input[placeholder*="Code"]',
      'input[name*="code"]',
      'input[id*="code"]',
      
      // Microsoft standard
      'input[name="otc"]',
      '#idTxtBx_SAOTCC_OTC',
      'input[data-testid="i0116"]',
      
      // Identification by attributes
      'input[type="text"][maxlength="6"]',
      'input[type="tel"][maxlength="6"]',
      'input[inputmode="numeric"]',
      'input[autocomplete="one-time-code"]'
    ];
    
    // Try selectors in order
    for (const selector of specificSelectors) {
      try {
        console.log(`Trying: ${selector}`);
        const locator = page.locator(selector);
        
        // Check element existence and visibility
        if (await locator.count() > 0) {
          const element = locator.first();
          if (await element.isVisible({ timeout: 2000 })) {
            totpInput = element;
            console.log(`✓ Found input: ${selector}`);
            break;
          }
        }
      } catch (e) {
        continue;
      }
    }
    
    // If not found, investigate all input fields
    if (!totpInput) {
      console.log("Specific selectors failed. Analyzing all inputs...");
      
      const allInputs = await page.locator('input').all();
      console.log(`Found ${allInputs.length} input elements:`);
      
      for (let i = 0; i < allInputs.length; i++) {
        const input = allInputs[i];
        try {
          const visible = await input.isVisible();
          if (!visible) continue;
          
          const type = await input.getAttribute('type');
          const name = await input.getAttribute('name');
          const id = await input.getAttribute('id');
          const ariaLabel = await input.getAttribute('aria-label');
          const placeholder = await input.getAttribute('placeholder');
          const maxlength = await input.getAttribute('maxlength');
          const className = await input.getAttribute('class');
          
          console.log(`Input ${i}: type="${type}" name="${name}" id="${id}" aria-label="${ariaLabel}" placeholder="${placeholder}" maxlength="${maxlength}" class="${className}" visible=${visible}`);
          
          // Detect 6-digit input field
          if (visible && (maxlength === '6' || type === 'tel' || 
                         (ariaLabel && ariaLabel.toLowerCase().includes('code')) ||
                         (placeholder && placeholder.toLowerCase().includes('code')))) {
            totpInput = input;
            console.log(`✓ Selected input ${i} as TOTP field`);
            break;
          }
        } catch (e) {
          console.log(`Input ${i}: Error - ${e.message}`);
        }
      }
    }
    
    if (!totpInput) {
      console.log("❌ No suitable input field found!");
      console.log("Manual input required - waiting 300 seconds...");
      await page.waitForTimeout(300000);
      return;
    }
    
    // TOTP generation and input processing
    if (TOTP_SECRET && TOTP_SECRET !== "YOUR_TOTP_SECRET_HERE") {
      const totpCode = generateTOTP(TOTP_SECRET);
      console.log(`Generated TOTP: ${totpCode}`);
      
      // Prepare input field
      console.log("Preparing input field...");
      await totpInput.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      
      // Method 1: pressSequentially (recommended method)
      console.log("Method 1: pressSequentially...");
      try {
        await totpInput.click();
        await page.waitForTimeout(500);
        
        // Clear existing values
        await totpInput.selectText();
        await page.keyboard.press('Delete');
        await page.waitForTimeout(500);
        
        // Input characters sequentially
        await totpInput.pressSequentially(totpCode, { delay: 200 });
        
        // Input confirmation
        const value1 = await totpInput.inputValue();
        console.log(`Result 1: "${value1}"`);
        if (value1 === totpCode) {
          console.log("✅ Method 1 SUCCESS!");
          await submitTwoFA(page, totpInput);
          return;
        }
      } catch (e) {
        console.log(`Method 1 failed: ${e.message}`);
      }
      
      // Method 2: Individual keystrokes
      console.log("Method 2: Individual keystrokes...");
      try {
        await totpInput.click();
        await page.waitForTimeout(500);
        
        // Complete clear
        await page.keyboard.press('Control+a');
        await page.keyboard.press('Delete');
        await page.waitForTimeout(500);
        
        // Manual input character by character
        for (let i = 0; i < totpCode.length; i++) {
          await page.keyboard.press(`Digit${totpCode[i]}`);
          await page.waitForTimeout(300);
          console.log(`Typed: ${totpCode.substring(0, i + 1)}`);
        }
        
        const value2 = await totpInput.inputValue();
        console.log(`Result 2: "${value2}"`);
        if (value2 === totpCode) {
          console.log("✅ Method 2 SUCCESS!");
          await submitTwoFA(page, totpInput);
          return;
        }
      } catch (e) {
        console.log(`Method 2 failed: ${e.message}`);
      }
      
      // Method 3: Direct JavaScript manipulation
      console.log("Method 3: JavaScript manipulation...");
      try {
        await page.evaluate((element, code) => {
          element.value = code;
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
        }, await totpInput.elementHandle(), totpCode);
        
        const value3 = await totpInput.inputValue();
        console.log(`Result 3: "${value3}"`);
        if (value3 === totpCode) {
          console.log("✅ Method 3 SUCCESS!");
          await submitTwoFA(page, totpInput);
          return;
        }
      } catch (e) {
        console.log(`Method 3 failed: ${e.message}`);
      }
      
      console.log("❌ All automatic input methods failed!");
    }
    
    // Manual input mode
    console.log("=".repeat(80));
    console.log("🔑 SWITCHING TO MANUAL INPUT MODE");
    console.log("Please enter your 2FA code manually in the browser");
    console.log("The input field has been located and focused for you");
    if (TOTP_SECRET && TOTP_SECRET !== "YOUR_TOTP_SECRET_HERE") {
      console.log(`Expected code: ${generateTOTP(TOTP_SECRET)}`);
    }
    console.log("Waiting 300 seconds for manual completion...");
    console.log("=".repeat(80));
    
    // Focus on the field
    await totpInput.click();
    await page.waitForTimeout(300000); // Wait 5 minutes
    
  } catch (error) {
    console.log(`❌ 2FA Error: ${error.message}`);
    console.log("Please complete 2FA manually");
    await page.waitForTimeout(180000);
  }
}


// Submission processing (no changes)
async function submitTwoFA(page, inputElement) {
  console.log("=== Submitting 2FA ===");
  
  await page.waitForTimeout(1000);
  
  // Submission method 1: Enter key
  try {
    await inputElement.press('Enter');
    console.log("✓ Submitted with Enter key");
    await page.waitForTimeout(5000);
    return;
  } catch (e) {
    console.log("Enter submission failed");
  }
  
  // Submission method 2: Button click
  const submitSelectors = [
    'button:has-text("Next")',
    'button:has-text("Verify")',
    'button:has-text("Submit")',
    'button:has-text("次へ")',
    'button:has-text("確認")',
    'button[type="submit"]',
    'input[type="submit"]',
    '[data-testid="primaryButton"]'
  ];
  
  for (const selector of submitSelectors) {
    try {
      const button = await page.locator(selector);
      if (await button.isVisible({ timeout: 2000 })) {
        await button.click();
        console.log(`✓ Submitted with: ${selector}`);
        await page.waitForTimeout(5000);
        return;
      }
    } catch (e) {
      continue;
    }
  }
  
  console.log("⚠️ No submit method worked");
}


async function clickElementIfVisible(elementToClick) {
  if (await elementToClick.isVisible()) {
    await elementToClick.click();
  }
}


async function executeBingSearch(page, searchTerm) {
  console.log(`Bing search for "${searchTerm}"...`);
  await page.goto(BING_URL, { waitUntil: "load" });
  for (const char of searchTerm) {
    await page.keyboard.type(char, {
      delay: 100 + Math.floor(Math.random() * 100),
    });
  }
  await sleepRandomizedSeconds(10);
  await page.keyboard.press("Enter");
  await page.locator("#b_results").waitFor({ timeout: 60000 });
}


function generateRandomSearchTermsList(length) {
  return BING_SEARCH_TERMS.flatMap(category =>
    category
      .slice()
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.ceil(length / BING_SEARCH_TERMS.length))
  )
    .sort(() => Math.random() - 0.5)
    .slice(0, length);
}


async function login(page) {
  console.log(`Login...`);
  await page.goto(BING_REWARDS_URL, { waitUntil: "load" });
  
  // Username input
  await page.keyboard.type(LOGIN_EMAIL_ADDRSS);
  await page.keyboard.press("Enter");
  
  // Processing for "Sign in another way" or "Other ways to sign in"
  try {
    console.log("Waiting for sign-in options...");
    await page.waitForTimeout(3000); // Wait for screen transition
    
    const alternativeSignInSelectors = [
      "text=Sign in another way",
      "text=Other ways to sign in",
      "text=別の方法でサインイン",
      "[data-testid='signInAnotherWay']",
      "a:has-text('Sign in another way')",
      "button:has-text('Sign in another way')",
      "a:has-text('Other ways to sign in')",
      "button:has-text('Other ways to sign in')"
    ];
    
    let alternativeSignInFound = false;
    for (const selector of alternativeSignInSelectors) {
      try {
        const element = await page.$(selector);
        if (element && await element.isVisible()) {
          console.log(`Found alternative sign-in option: ${selector}`);
          await element.click();
          alternativeSignInFound = true;
          await page.waitForTimeout(2000); // Wait for screen transition after click
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (alternativeSignInFound) {
      console.log("Clicked alternative sign-in, now looking for password option...");
    }
    
  } catch (e) {
    console.log("Alternative sign-in option not found, proceeding...");
  }
  
  // Processing for "Use your password"
  try {
    const usePasswordSelectors = [
      "text=Use your password",
      "text=パスワードを使用",
      "[data-testid='usePassword']",
      "a:has-text('Use your password')",
      "button:has-text('Use your password')",
      "div:has-text('Use your password')",
      "[aria-label*='password']"
    ];
    
    let passwordOptionFound = false;
    for (const selector of usePasswordSelectors) {
      try {
        const element = await page.$(selector);
        if (element && await element.isVisible()) {
          console.log(`Found password option: ${selector}`);
          await element.click();
          passwordOptionFound = true;
          await page.waitForTimeout(2000); // Wait for screen transition after click
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (passwordOptionFound) {
      console.log("Selected password authentication method");
    }
    
  } catch (e) {
    console.log("Password option not found, proceeding...");
  }
  
  // Password input
  try {
    console.log("Looking for password input field...");
    
    const passwordSelectors = [
      'input[type="password"]',
      'input[name="passwd"]',
      'input[name="password"]',
      '[data-testid="i0118"]',
      '#i0118'
    ];
    
    let passwordInput = null;
    for (const selector of passwordSelectors) {
      try {
        passwordInput = await page.waitForSelector(selector, { timeout: 5000 });
        if (passwordInput && await passwordInput.isVisible()) {
          console.log(`Found password input: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (passwordInput) {
      await passwordInput.fill(LOGIN_PASSWORD);
      console.log("Password entered");
    } else {
      // Fallback: use getByRole
      await page.getByRole("textbox", { name: "Password" }).fill(LOGIN_PASSWORD);
      console.log("Password entered using fallback method");
    }
    
  } catch (e) {
    console.log(`Password input error: ${e.message}`);
  }
  
  // Click sign-in button
  try {
    const signInSelectors = [
      '[data-testid="primaryButton"]',
      'input[type="submit"]',
      'button[type="submit"]',
      '#idSIButton9',
      "button:has-text('Sign in')",
      "button:has-text('サインイン')"
    ];
    
    let signInButton = null;
    for (const selector of signInSelectors) {
      try {
        signInButton = await page.$(selector);
        if (signInButton && await signInButton.isVisible()) {
          console.log(`Found sign-in button: ${selector}`);
          await signInButton.click();
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!signInButton) {
      // Fallback: use getByTestId
      await page.getByTestId("primaryButton").click();
    }
    
    console.log("Sign-in button clicked");
    
  } catch (e) {
    console.log(`Sign-in button click error: ${e.message}`);
  }
  
  // 2FA processing
  await handle2FA(page);
  
  // "Stay signed in" processing
  try {
    await page.waitForTimeout(3000); // Wait for screen transition
    const staySignedInButton = await page.getByTestId("primaryButton");
    if (await staySignedInButton.isVisible()) {
      await staySignedInButton.click();
      console.log("Clicked stay signed in button");
    }
  } catch (error) {
    console.log("Stay signed in button not found or already handled");
  }
}



async function clickEveryPendingActivityCard(page) {
  console.log(`Clicking on every pending activity card...`);
  await page.goto(BING_REWARDS_URL, { waitUntil: "load" });
  const elementsToClick = await page.locator(
    BING_REWARDS_ACTIVITY_CARD_SELECTOR
  ).elementHandles();
  console.log(`Found ${elementsToClick.length} pending activity cards.`)
  for (const elementToClick of elementsToClick) {
    console.log(`Click on activity card...`);
    await elementToClick.click();
    await sleepRandomizedSeconds(60);
  }
}


async function executeBingSearches(page, searchTerms) {
  console.log(`Executing bing searches for ${searchTerms.length} terms...`);
  for (const searchTerm of searchTerms) {
    await sleepRandomizedSeconds(1200);
    let currentTry = 1;
    while (currentTry <= 3) {
      try {
        await executeBingSearch(page, searchTerm);
        break;
      }
      catch (error) {
        console.log(`Error occured during search: ${error.message}.`);
        currentTry++;
      }
    }
  }
}


async function sleepRandomizedSeconds(max) {
  const minMs = 1000;
  const maxMs = max * 1000;
  const randomMs = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  console.log(`Sleeping for ${(randomMs / 1000).toFixed(2)} seconds...`);
  return new Promise((resolve) => setTimeout(resolve, randomMs));
}


async function createPage(device) {
  const browserDir = BROWSER_USER_DIR + (device.isMobile ? "-mobile" : "");
  const context = await chromium.launchPersistentContext(browserDir, {
    headless: false,
    geolocation: { latitude: 0, longitude: 0 },
    permissions: [],
    args: [
      "--no-sandbox",
      "--use-gl=swiftshader",
      "--enable-webgl",
      "--ignore-gpu-blocklist"
    ],
    ...device,
  });
  const page = await context.newPage();
  
  // prevent opening of passkey dialog
  await context.addInitScript(() => {
    if ("credentials" in navigator) {
      navigator.credentials.get = () => {
        return Promise.resolve(null);
      };
      navigator.credentials.create = () => {
        return Promise.resolve(null);
      };
    }
    if (device.isMobile) {
      Object.defineProperty(navigator, 'platform', { get: () => 'Linux armv8l' });
      Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 5 });
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 4 });
      Object.defineProperty(navigator, 'deviceMemory', { get: () => 4 });
      delete Object.getPrototypeOf(navigator).webdriver;
      window.ontouchstart = () => true;
      window.ontouchend = () => true;
      
      (() => {
        const OriginalPluginArray = Object.getPrototypeOf(navigator.plugins).constructor;
        const OriginalMimeTypeArray = Object.getPrototypeOf(navigator.mimeTypes).constructor;
        
        function FakePlugin(name, description, filename, mimeTypes) {
          this.name = name;
          this.description = description;
          this.filename = filename;
          mimeTypes.forEach((mt, idx) => (this[idx] = mt));
          this.length = mimeTypes.length;
        }
        function FakeMimeType(type, suffixes, description) {
          this.type = type;
          this.suffixes = suffixes;
          this.description = description;
          this.enabledPlugin = null;
        }
        
        const pdfMime = new FakeMimeType('application/pdf', 'pdf', '');
        const naclMime = new FakeMimeType('application/x-nacl', '', '');
        const chromePdfPlugin = new FakePlugin('Chrome PDF Plugin', 'Portable Document Format', 'internal-pdf-viewer', [pdfMime]);
        const chromePdfViewer = new FakePlugin('Chrome PDF Viewer', '', 'mhjfbmdgcfjbbpaeojofohoefgiehjai', [pdfMime]);
        const nativeClient = new FakePlugin('Native Client', '', 'internal-nacl-plugin', [naclMime]);
        
        [pdfMime].forEach(mt => (mt.enabledPlugin = chromePdfPlugin));
        [naclMime].forEach(mt => (mt.enabledPlugin = nativeClient));
        
        const pluginArray = new OriginalPluginArray();
        [chromePdfPlugin, chromePdfViewer, nativeClient].forEach((plg, idx) => (pluginArray[idx] = plg));
        pluginArray.length = 3;
        pluginArray.item = function (idx) { return this[idx]; };
        pluginArray.namedItem = function (name) {
          for (let i = 0; i < this.length; i++) { if (this[i].name === name) return this[i]; }
          return null;
        };
        
        const mimeArray = new OriginalMimeTypeArray();
        [pdfMime, naclMime].forEach((mt, idx) => (mimeArray[idx] = mt));
        mimeArray.length = 2;
        mimeArray.item = function (idx) { return this[idx]; };
        mimeArray.namedItem = function (type) {
          for (let i = 0; i < this.length; i++) { if (this[i].type === type) return this[i]; }
          return null;
        };
        
        Object.setPrototypeOf(pluginArray, OriginalPluginArray.prototype);
        Object.setPrototypeOf(mimeArray, OriginalMimeTypeArray.prototype);
        Object.defineProperty(navigator, 'plugins', { get: () => pluginArray });
        Object.defineProperty(navigator, 'mimeTypes', { get: () => mimeArray });
        
        const NavigatorProto = Object.getPrototypeOf(navigator);
        Object.defineProperty(NavigatorProto, 'plugins', { get: () => pluginArray });
        Object.defineProperty(NavigatorProto, 'mimeTypes', { get: () => mimeArray });
      })();
      Object.defineProperty(navigator, 'userAgentData', {
        get: () => ({
          brands: [{ brand: "Chromium", version: "136" }],
          mobile: true,
          platform: "Android"
        })
      });
    }
  });
  
  // close all popups that may occur
  context.on("page", async (popup) => {
    await popup.close();
  });
  return page;
}


// Main execution part
(async () => {
  console.log(`Started checking microsoft with 2FA support`);
  const searchTerms = generateRandomSearchTermsList(60);
  
  // Desktop version execution
  const desktopPage = await createPage(devices["Desktop Chrome"]);
  await login(desktopPage);
  await clickEveryPendingActivityCard(desktopPage);
  await executeBingSearches(desktopPage, searchTerms.slice(0, 35));
  desktopPage.context().close();
  
  // Mobile version execution
  const mobilePage = await createPage(devices["Pixel 7"]);
  await login(mobilePage);
  await clickEveryPendingActivityCard(mobilePage);
  await executeBingSearches(mobilePage, searchTerms.slice(-25));
  mobilePage.context().close();
})();
