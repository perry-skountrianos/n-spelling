// Common Core 6 Math Mastery — practice problems with mini-lessons
// Covers: 6.EE (Expressions & Equations), 6.NS (Number System),
//         6.RP (Ratios & Proportional Relationships), 6.G (Geometry),
//         6.SP (Statistics & Probability)
//
// Topic structure:
//   "Day N — Title (standard)": {
//       lesson: "<html string with key concepts, formulas, examples>",
//       questions: [ ...question objects... ]
//   }
//
// Question types:
//   { type: "mc",      question, options: [..], answer: <index> }
//   { type: "multi",   question, options: [..], answer: [<indices>] }   // Choose ALL that apply
//   { type: "tf",      question, labels: ["True","False"], answer: <0|1> }
//   { type: "numeric", question, answer: <number|string>, tolerance?: <number>, unit?: "..." }

const mathPracticeData = {

    // =====================================================================
    // 6.EE — EXPRESSIONS & EQUATIONS
    // =====================================================================

    "1 — Order of Operations (6.EE.1)": {
        lesson: `
            <h3>Order of Operations — PEMDAS</h3>
            <p>When an expression has more than one operation, you have to do them in a fixed order:</p>
            <ol>
                <li><b>P</b>arentheses (and other grouping symbols)</li>
                <li><b>E</b>xponents (powers like 6²)</li>
                <li><b>M</b>ultiplication and <b>D</b>ivision — left to right</li>
                <li><b>A</b>ddition and <b>S</b>ubtraction — left to right</li>
            </ol>
            <p><b>Watch out:</b> exponents come <i>before</i> multiplication. So in <code>6² + 7 × 4</code> you do <code>6² = 36</code> first, then <code>7 × 4 = 28</code>, then add: <code>36 + 28 = 64</code>.</p>
            <p><b>Exponent reminder:</b> <code>5³</code> means <code>5 × 5 × 5 = 125</code>. <code>0.5³</code> means <code>0.5 × 0.5 × 0.5 = 0.125</code>.</p>
            <p><b>Volume of a cube:</b> <code>V = s³</code> (the side length cubed).</p>
        `,
        questions: [
            { type: "mc", question: "Evaluate: 6² + 7 × 4",
              options: ["100", "244", "64", "892"], answer: 2,
              resolveSteps: ["6² + 7 × 4", "36 + 7 × 4", "36 + 28", "64"],
              hint: "Remember PEMDAS: Exponents before Multiplication. Find 6² first, then 7 × 4.",
              explanation: "Exponents first: 6² = 36. Then multiplication: 7×4 = 28. Then addition: 36 + 28 = 64." },
            { type: "mc", question: "Evaluate: 3 + 2 × 5²",
              options: ["53", "125", "625", "28"], answer: 0,
              resolveSteps: ["3 + 2 × 5²", "3 + 2 × 25", "3 + 50", "53"],
              hint: "Start with the exponent 5². Then multiply by 2. Finally add 3.",
              explanation: "Exponent: 5² = 25. Multiply: 2×25 = 50. Add: 3 + 50 = 53." },
            { type: "mc", question: "Evaluate: (4 + 2)³ ÷ 2",
              options: ["108", "36", "12", "13"], answer: 0,
              resolveSteps: ["(4 + 2)³ ÷ 2", "6³ ÷ 2", "216 ÷ 2", "108"],
              hint: "Parentheses first: 4 + 2 = 6. Then apply the exponent. Finally divide by 2.",
              explanation: "Parentheses: 4+2 = 6. Exponent: 6³ = 216. Divide: 216 ÷ 2 = 108." },
            { type: "numeric", question: "Find the value of 0.5³ as a decimal.",
              answer: 0.125, tolerance: 0.001,
              resolveSteps: ["0.5³", "0.5 × 0.5 × 0.5", "0.25 × 0.5", "0.125"],
              hint: "0.5³ means 0.5 × 0.5 × 0.5. Start by finding 0.5 × 0.5.",
              explanation: "0.5 × 0.5 × 0.5 = 0.25 × 0.5 = 0.125." },
            { type: "numeric", question: "Evaluate: 2³ + 4 × (10 − 7)",
              answer: 20,
              resolveSteps: ["2³ + 4 × (10 − 7)", "2³ + 4 × 3", "8 + 12", "20"],
              hint: "Work from the inside out: first solve what's in parentheses, then handle the exponent and multiplication.",
              explanation: "Parentheses: 10−7=3. Exponent: 2³=8. Multiply: 4×3=12. Add: 8+12=20." },
            { type: "mc", question: "Which expression equals 50?",
              options: ["10 + 4 × 5", "(10 + 4) × 10", "10² ÷ 2", "5 + 5²"], answer: 2,
              hint: "Try calculating 10² ÷ 2. Remember that 10² = 100.",
              explanation: "10² ÷ 2 = 100 ÷ 2 = 50. Others: 10+4×5 = 30; (10+4)×10 = 140; 5+5² = 30." },
            { type: "numeric", question: "Find the volume of a cube with side length 0.5 inch (cubic inches, decimal form).",
              answer: 0.125, tolerance: 0.001, unit: "in³",
              resolveSteps: ["V = s³", "V = 0.5³", "V = 0.125", "0.125 in³"],
              hint: "The formula for volume of a cube is V = s³. Your side length is 0.5.",
              explanation: "V = s³ = 0.5³ = 0.125 in³." },
            { type: "tf", question: "Is this true?  4 + 3 × 2 = 14",
              labels: ["True", "False"], answer: 1,
              hint: "Multiply first: what is 3 × 2? Then add that result to 4.",
              explanation: "False. Multiplication before addition: 3×2 = 6, then 4+6 = 10, not 14." }
        ]
    },

    "2 — Translating & Equivalent Expressions (6.EE.2–4)": {
        lesson: `
            <h3>Words → Algebra</h3>
            <p>Translate carefully — order matters with subtraction!</p>
            <ul>
                <li><b>"Sum of"</b> = + &nbsp;&nbsp; <b>"Difference"</b> = − &nbsp;&nbsp; <b>"Product"</b> = × &nbsp;&nbsp; <b>"Quotient"</b> = ÷</li>
                <li><b>"Twice a number"</b> = 2n &nbsp;&nbsp; <b>"3 more than n"</b> = n + 3</li>
                <li><b>"8 less than the product of 6 and x"</b> = <code>6x − 8</code> (NOT <code>8 − 6x</code>) — "less than" flips the order!</li>
            </ul>
            <h3>Equivalent Expressions</h3>
            <p>Two expressions are equivalent if they always give the same value for any input.</p>
            <ul>
                <li><b>Distributive property:</b> <code>a(b + c) = ab + ac</code>. So <code>3(x + 4) = 3x + 12</code>.</li>
                <li><b>Combining like terms:</b> <code>4x + 6x = 10x</code> (same variable adds). But <code>9x + 2y</code> can't be simplified to <code>11xy</code> — different variables don't combine.</li>
                <li><b>Multiplying coefficients:</b> <code>4(6x) = 24x</code>.</li>
            </ul>
        `,
        questions: [
            { type: "mc", question: "Which expression represents '8 less than the product of 6 and a number x'?",
              options: ["8 − 6x", "6x − 8", "(6 + x) − 8", "8 − (6 + x)"], answer: 1,
              hint: "First find the product of 6 and x. Then '8 less than' means subtract 8 from that product.",
              explanation: "'Product of 6 and x' is 6x. '8 less than' means subtract 8 from it: 6x − 8." },
            { type: "mc", question: "Which expression represents '5 more than twice a number n'?",
              options: ["5n + 2", "2n + 5", "2(n + 5)", "5 − 2n"], answer: 1,
              hint: "Write what 'twice a number n' is. Then '5 more than' means add 5 to it.",
              explanation: "'Twice n' = 2n. '5 more than' adds 5: 2n + 5." },
            { type: "multi", question: "Choose ALL pairs of equivalent expressions.",
              options: ["4(6x) and 24x", "4(6x) and 10x", "4x + 6x and 10x", "4x + 6x and 24x"],
              answer: [0, 2],
              hint: "Multiply or combine like terms for each option. 4(6x) uses distribution. 4x + 6x combines like terms.",
              explanation: "4(6x)=24x. 4x+6x=10x. The other two mix up the operations." },
            { type: "multi", question: "Choose ALL pairs that are equivalent.",
              options: ["x+y+x+y and 2(x+y)", "5(2x − 3y) and 10x − 3y", "4x − 5y and 5y − 4x", "9x + 2y and 11xy"],
              answer: [0],
              hint: "For each pair, use distribution or combine like terms. Check if both sides are the same.",
              explanation: "Only x+y+x+y = 2x+2y = 2(x+y). 5(2x−3y) = 10x−15y. 4x−5y ≠ 5y−4x. 9x+2y can't combine into 11xy." },
            { type: "mc", question: "Which is equivalent to 3(x + 4)?",
              options: ["3x + 4", "x + 12", "3x + 12", "3x · 12"], answer: 2,
              hint: "Distribute the 3: multiply 3 by x, and also multiply 3 by 4.",
              explanation: "Distribute: 3·x + 3·4 = 3x + 12." },
            { type: "mc", question: "Which is equivalent to 8x + 12?",
              options: ["4(2x + 3)", "4(2x + 12)", "8(x + 12)", "20x"], answer: 0,
              hint: "What number divides evenly into both 8 and 12? Factor that out.",
              explanation: "GCF of 8 and 12 is 4. Factor out 4: 4(2x + 3)." },
            { type: "numeric", question: "Evaluate the expression 2a + 3b when a = 5 and b = 4.",
              answer: 22,
              hint: "Replace a with 5 and b with 4. Then calculate: 2(5) + 3(4).",
              explanation: "Substitute: 2(5) + 3(4) = 10 + 12 = 22." },
            { type: "tf", question: "Are 2(x + 3) and 2x + 3 equivalent expressions?",
              labels: ["True", "False"], answer: 1,
              hint: "Distribute the 2 in 2(x + 3). What do you get? Is it the same as 2x + 3?",
              explanation: "False. 2(x+3) = 2x + 6, not 2x + 3." }
        ]
    },

    "3 — One-Step Equations (6.EE.5, 6.EE.7)": {
        lesson: `
            <h3>Solving One-Step Equations</h3>
            <p>To solve, do the <b>opposite operation</b> on both sides to isolate the variable.</p>
            <table style="border-collapse:collapse;margin:8px 0;">
                <tr><th style="text-align:left;padding:4px 12px 4px 0;">Equation</th><th style="text-align:left;padding:4px;">Do this to both sides</th></tr>
                <tr><td style="padding:4px 12px 4px 0;"><code>x + 7 = 12</code></td><td>Subtract 7 → <code>x = 5</code></td></tr>
                <tr><td style="padding:4px 12px 4px 0;"><code>x − 4 = 9</code></td><td>Add 4 → <code>x = 13</code></td></tr>
                <tr><td style="padding:4px 12px 4px 0;"><code>5x = 30</code></td><td>Divide by 5 → <code>x = 6</code></td></tr>
                <tr><td style="padding:4px 12px 4px 0;"><code>x ÷ 3 = 8</code></td><td>Multiply by 3 → <code>x = 24</code></td></tr>
            </table>
            <h3>Dividing fractions / by a fraction</h3>
            <p>To divide a fraction by a whole number, multiply the <b>denominator</b> by the whole number:</p>
            <p><code>4w = 2/3</code> &nbsp;→&nbsp; <code>w = (2/3) ÷ 4 = (2/3) × (1/4) = 2/12</code> (= 1/6). <i>Common mistake: writing 2/7 — that adds 4 to the denominator instead of multiplying.</i></p>
            <h3>Checking solutions</h3>
            <p>Plug the value back in. If both sides match, it's a solution. Example: is <code>x=5</code> a solution to <code>2x + 4 = 14</code>? <code>2(5) + 4 = 14 ✓</code> Yes.</p>
        `,
        questions: [
            { type: "mc", question: "Solve: 4w = 2/3",
              options: ["w = 2/12", "w = 2/7", "w = 8/3", "w = 3 1/3"], answer: 0,
              hint: "To isolate w, divide both sides by 4. When dividing by a fraction, multiply by its reciprocal.",
              explanation: "Divide both sides by 4: w = (2/3) ÷ 4 = (2/3) · (1/4) = 2/12 (= 1/6)." },
            { type: "multi", question: "Select the equation(s) where x = 5 is a solution. Choose ALL that apply.",
              options: ["2x + 4 = 14", "5x = 55", "6x + 3 = 14", "8 + 3x = 23", "6x = 30", "5x = 1"],
              answer: [0, 3, 4],
              hint: "Replace x with 5 in each equation and check if both sides are equal.",
              explanation: "Substitute x=5: 2(5)+4=14 ✓; 5(5)=25 ✗; 6(5)+3=33 ✗; 8+3(5)=23 ✓; 6(5)=30 ✓; 5(5)=25 ✗." },
            { type: "mc", question: "There are 25 cans of soup in a case. The manager needs 325 cans. Which equation finds x, the number of cases?",
              options: ["25 + x = 325", "25x = 325", "x − 25 = 325", "None of the above"], answer: 1,
              hint: "If each case has 25 cans and you need 325 total, multiply: (cans per case) × (number of cases) = total cans.",
              explanation: "Cans per case × number of cases = total cans → 25x = 325. (x = 13)." },
            { type: "numeric", question: "Solve for x:  x + 17 = 42",
              answer: 25,
              hint: "What number plus 17 equals 42? Or subtract 17 from both sides.",
              explanation: "Subtract 17 from both sides: x = 42 − 17 = 25." },
            { type: "numeric", question: "Solve for y:  y / 6 = 9",
              answer: 54,
              hint: "If y divided by 6 equals 9, multiply both sides by 6 to find y.",
              explanation: "Multiply both sides by 6: y = 54." },
            { type: "numeric", question: "Sierra walks her dog twice a day. Her evening walk is 2.5 times her morning walk. In one full week (7 days) she walked 30 miles total. To the nearest tenth, how long is her morning walk (miles)?",
              answer: 1.2, tolerance: 0.1,
              hint: "Each day she walks: morning + evening = m + 2.5m = 3.5m miles. In a week: 7 × 3.5m = 30. Solve for m.",
              explanation: "Each day she walks m + 2.5m = 3.5m miles. In a week: 7 × 3.5m = 24.5m = 30. m = 30/24.5 ≈ 1.22 ≈ 1.2 miles." },
            { type: "tf", question: "Is x = 8 a solution to 3x − 5 = 19?",
              labels: ["True", "False"], answer: 0,
              hint: "Plug in x = 8: calculate 3(8) − 5 and see if it equals 19.",
              explanation: "True. 3(8) − 5 = 24 − 5 = 19. ✓" }
        ]
    },

    "4 — Inequalities (6.EE.8)": {
        lesson: `
            <h3>Inequality Symbols</h3>
            <ul>
                <li><code>&lt;</code> "less than" &nbsp;&nbsp; <code>&gt;</code> "greater than"</li>
                <li><code>≤</code> "less than or equal to" — use for "<i>at most</i>", "<i>no more than</i>"</li>
                <li><code>≥</code> "greater than or equal to" — use for "<i>at least</i>", "<i>no less than</i>"</li>
            </ul>
            <h3>Number-line graphs</h3>
            <ul>
                <li><b>Open circle</b> ○ on the number → strict inequality (<code>&lt;</code> or <code>&gt;</code>) — that number is NOT included.</li>
                <li><b>Closed/filled circle</b> ● on the number → ≤ or ≥ — that number IS included.</li>
                <li>Arrow points the direction of the solution.</li>
            </ul>
            <h3>Solving inequalities</h3>
            <p>Treat the inequality like an equation: <code>2x ≥ 14</code> → divide by 2 → <code>x ≥ 7</code>.</p>
            <h3>Comparing negatives</h3>
            <p>On the number line, the number farther <b>right</b> is greater. So <code>−3 &gt; −7</code> because −3 is to the right of −7.</p>
        `,
        questions: [
            { type: "mc", question: "A ride sign says 'You must be at least 52 inches tall.' If h is height in inches, which inequality fits?",
              options: ["h < 52", "h > 52", "h ≤ 52", "h ≥ 52"], answer: 3,
              hint: "'At least' means 52 or taller. Which symbol includes the boundary value?",
              explanation: "'At least 52' includes 52 and anything taller, so h ≥ 52." },
            { type: "multi", question: "A log ride holds 12 people. Each child weighs ~90 lbs and 4 adults are seated. The inequality 90C ≤ 540 represents how many more children can ride. Select ALL groups that can safely ride. (C = number of children.)",
              options: ["Group A: 4 children", "Group B: 3 children", "Group C: 9 children", "Group D: 6 children"],
              answer: [0, 1, 3],
              hint: "Solve: C ≤ 540/90. What number do you get? Which group sizes are that many or fewer?",
              explanation: "C ≤ 540/90 = 6. So groups of 4, 3, and 6 are OK; 9 is too many." },
            { type: "multi", question: "For each inequality, select ALL that are TRUE.",
              options: ["−3 > −5", "−5 > −3", "−3 < −5", "−5 < −3"],
              answer: [0, 3],
              hint: "Draw or imagine a number line. Which number is farther to the right?",
              explanation: "On a number line, −3 is to the right of −5, so −3 > −5 (and equivalently −5 < −3)." },
            { type: "multi", question: "Identify ALL statements/representations that match x > 4.",
              options: ["The temperature increased by 4°F.", "The value of x is greater than 4.", "Marcus drinks more than 4 glasses of water every day.", "Number line: open circle on 4, arrow right.", "Number line: closed circle on 4, arrow right."],
              answer: [1, 2, 3],
              hint: "x > 4 means strictly greater than (NOT equal to 4). Does the circle include 4 or not? Which way does the arrow go?",
              explanation: "x > 4 means strictly more than 4: open circle on 4 with arrow right. Closed circle would mean ≥4. 'Increased BY 4' is +4, not >4." },
            { type: "mc", question: "Solve and choose the solution set: 2x ≥ 14",
              options: ["x ≥ 7", "x ≤ 7", "x ≥ 12", "x > 7"], answer: 0,
              hint: "Divide both sides by 2 to isolate x. What does x equal or exceed?",
              explanation: "Divide both sides by 2: x ≥ 7." },
            { type: "tf", question: "Is the inequality −3 < −7 true?",
              labels: ["True", "False"], answer: 1,
              hint: "On a number line, is −3 to the left or right of −7? That tells you if −3 is less than or greater than −7.",
              explanation: "False. −3 is to the RIGHT of −7 on the number line, so −3 > −7." }
        ]
    },

    "5 — Variables, Tables & Equations (6.EE.9)": {
        lesson: `
            <h3>Independent vs Dependent Variables</h3>
            <ul>
                <li><b>Independent variable</b> = the input you choose freely (often <i>x</i>, "boxes sold", "hours worked").</li>
                <li><b>Dependent variable</b> = the output that <i>depends on</i> the input (often <i>y</i>, "money earned", "distance traveled").</li>
            </ul>
            <h3>Building an equation from a real situation</h3>
            <ol>
                <li>Find the <b>rate</b> per unit. (e.g., a box of 20 bars at $1.50 each → $30 per box.)</li>
                <li>Multiply the rate by the input variable, plus any fixed amount.</li>
                <li>Result: <code>m = 30b</code> — money equals $30 times boxes.</li>
            </ol>
            <h3>Reading a table</h3>
            <p>Look for the pattern: when one column doubles, does the other double? If yes, it's a <b>proportional relationship</b> (always passes through 0). The pattern in a table is the rate — divide one column by the other to find it.</p>
        `,
        questions: [
            { type: "mc", question: "Stephanie's band sells boxes of chocolate bars. Each box has 20 bars at $1.50 each. Which equation gives money m collected from b boxes?",
              options: ["b = 30 + m", "m = 30 + b", "b = 30m", "m = 30b"], answer: 3,
              hint: "Find the rate per box: 20 × $1.50. Then write: money = rate × number of boxes.",
              explanation: "Each box collects 20 × $1.50 = $30. So m = 30 × b." },
            { type: "mc", question: "In m = 30b, which is dependent and which is independent?",
              options: ["b is dependent, m is independent", "m is dependent, b is independent", "Both are dependent", "Both are independent"], answer: 1,
              hint: "Independent = you choose freely. Dependent = it depends on the other variable. What do you choose: boxes or money?",
              explanation: "You CHOOSE how many boxes (b) — independent. The money (m) DEPENDS on it — dependent." },
            { type: "numeric", question: "Using m = 30b, how much money is collected from 100 boxes? (in dollars)",
              answer: 3000,
              hint: "Substitute b = 100 into the equation m = 30b.",
              explanation: "m = 30 × 100 = $3,000." },
            { type: "numeric", question: "The band collected $1,530. Using m = 30b, how many boxes did they sell?",
              answer: 51,
              hint: "Replace m with 1530: 1530 = 30b. Now solve for b by dividing.",
              explanation: "1530 = 30b → b = 1530 / 30 = 51 boxes." },
            { type: "numeric", question: "A taxi charges $3 plus $2 per mile. Using c = 3 + 2m, what is the cost (dollars) for a 12-mile trip?",
              answer: 27,
              hint: "Substitute m = 12: c = 3 + 2(12). Calculate.",
              explanation: "c = 3 + 2(12) = 3 + 24 = $27." },
            { type: "mc", question: "In y = 4x, if x doubles from 3 to 6, what happens to y?",
              options: ["y stays the same", "y also doubles", "y halves", "y increases by 2"], answer: 1,
              hint: "Calculate y when x = 3, then when x = 6. Compare the values.",
              explanation: "y = 4(3)=12 → y = 4(6)=24. y doubled — this is a proportional relationship." }
        ]
    },

    // =====================================================================
    // 6.NS — THE NUMBER SYSTEM
    // =====================================================================

    "6 — Fraction & Decimal Operations (6.NS.1, 6.NS.3)": {
        lesson: `
            <h3>Dividing fractions — "Keep, Change, Flip"</h3>
            <p>To divide by a fraction, multiply by its <b>reciprocal</b> (flip it):</p>
            <p><code>(1/2) ÷ (3/4) = (1/2) × (4/3) = 4/6 = 2/3</code></p>
            <p><b>Word-problem trick:</b> if "1/3 of the trip is 1/4 mile", then total = part ÷ fraction = <code>(1/4) ÷ (1/3) = (1/4) × 3 = 3/4 mile</code>.</p>
            <h3>Fraction → Decimal</h3>
            <p>Divide numerator by denominator: <code>3/4 = 3 ÷ 4 = 0.75</code>.</p>
            <h3>Decimal arithmetic — no calculator</h3>
            <ul>
                <li><b>Adding/Subtracting:</b> line up the decimal points.</li>
                <li><b>Multiplying:</b> ignore decimals, multiply, then count total decimal places. <code>$24.50 × 6</code>: 2450×6 = 14700 → 2 decimal places → $147.00.</li>
                <li><b>Dividing by a decimal:</b> shift the decimal in BOTH numbers until the divisor is a whole number, then divide normally.</li>
            </ul>
        `,
        questions: [
            { type: "numeric", question: "The length of a parking lot is 2/3 mile and the area is 1/2 square mile. Width = Area ÷ Length. What is the width? (Give as a fraction or decimal.)",
              answer: 0.75, tolerance: 0.01,
              explanation: "Width = (1/2) ÷ (2/3) = (1/2) × (3/2) = 3/4 mile = 0.75 mile." },
            { type: "numeric", question: "Rosa ran 1/3 of the way to school and that distance was 1/4 mile. How far is it from her home to school? (Give in DECIMAL form.)",
              answer: 0.75, tolerance: 0.01, unit: "mile",
              explanation: "Total = (1/4) ÷ (1/3) = (1/4) × 3 = 3/4 mile = 0.75 mile." },
            { type: "numeric", question: "Jayden has $20.56. He buys an apple for $0.79 and a granola bar for $1.76. How much money does he have now? (dollars)",
              answer: 18.01, tolerance: 0.005,
              explanation: "0.79 + 1.76 = 2.55. 20.56 − 2.55 = $18.01." },
            { type: "numeric", question: "Juanita spent $24.50 on each of her 6 grandchildren. How much did she spend in all? (dollars)",
              answer: 147,
              explanation: "24.50 × 6 = $147.00." },
            { type: "numeric", question: "Helen spent $227.50 equally on her 7 grandchildren. How much per grandchild? (dollars)",
              answer: 32.5, tolerance: 0.01,
              explanation: "227.50 ÷ 7 = $32.50." },
            { type: "numeric", question: "Compute: 1/2 ÷ 3/8  (give as a fraction or decimal)",
              answer: 1.333, tolerance: 0.01,
              explanation: "(1/2) × (8/3) = 8/6 = 4/3 ≈ 1.33." },
            { type: "tf", question: "Dividing by 1/2 is the same as multiplying by 2.",
              labels: ["True", "False"], answer: 0,
              explanation: "True. The reciprocal of 1/2 is 2, so ÷(1/2) = ×2." }
        ]
    },

    "7 — GCF, LCM & Distributive (6.NS.4)": {
        lesson: `
            <h3>Greatest Common Factor (GCF)</h3>
            <p>The largest number that divides both numbers evenly.</p>
            <p><b>Method (prime factorization):</b></p>
            <ul>
                <li>Break each number into primes: 48 = 2·2·2·2·3 ; 64 = 2·2·2·2·2·2</li>
                <li>Multiply the primes they SHARE: 2·2·2·2 = <b>16</b>. So GCF(48, 64) = 16.</li>
            </ul>
            <h3>Least Common Multiple (LCM)</h3>
            <p>The smallest number that BOTH numbers divide into.</p>
            <p><b>Quick method:</b> list multiples until you find a match.</p>
            <ul>
                <li>Multiples of 8: 8, 16, <b>24</b>, 32, 40…</li>
                <li>Multiples of 12: 12, <b>24</b>, 36…</li>
                <li>LCM(8, 12) = 24.</li>
            </ul>
            <h3>Distributive property with GCF</h3>
            <p>Use GCF to factor a sum: <code>48 + 64 = 16(3 + 4)</code>.</p>
        `,
        questions: [
            { type: "numeric", question: "What is the greatest common factor (GCF) of 48 and 64?",
              answer: 16,
              explanation: "48 = 2⁴·3 ; 64 = 2⁶. Shared primes: 2⁴ = 16." },
            { type: "numeric", question: "What is the least common multiple (LCM) of 8 and 12?",
              answer: 24,
              explanation: "Multiples of 8: 8,16,24… Multiples of 12: 12,24… LCM = 24." },
            { type: "numeric", question: "GCF of 18 and 30?",
              answer: 6,
              explanation: "18 = 2·3·3 ; 30 = 2·3·5. Shared: 2·3 = 6." },
            { type: "numeric", question: "LCM of 6 and 9?",
              answer: 18,
              explanation: "Multiples of 6: 6,12,18… Multiples of 9: 9,18… LCM = 18." },
            { type: "mc", question: "Which expression is equivalent to 36 + 24 using the distributive property and the GCF?",
              options: ["6(6 + 4)", "12(3 + 2)", "4(9 + 6)", "All of the above"], answer: 3,
              explanation: "All work, but 12 is the GCF, so 12(3+2) is the most factored form. Each option is mathematically equivalent to 60." },
            { type: "tf", question: "GCF(7, 13) = 1.",
              labels: ["True", "False"], answer: 0,
              explanation: "True. 7 and 13 are both prime, so they share no factor other than 1." }
        ]
    },

    "8 — Integers & Absolute Value (6.NS.5–7)": {
        lesson: `
            <h3>Integers</h3>
            <p>Whole numbers and their opposites: …−3, −2, −1, 0, 1, 2, 3…</p>
            <h3>Opposites</h3>
            <p>The opposite of a number is the same distance from 0 on the other side. The opposite of <b>−3</b> is <b>3</b>. So <code>−(−3) = 3</code>.</p>
            <h3>Absolute Value</h3>
            <p><code>|n|</code> = the distance from 0 — always non-negative.</p>
            <p><code>|−6| = 6</code> &nbsp;&nbsp; <code>|3| = 3</code></p>
            <h3>Comparing negative numbers</h3>
            <p>On the number line, the rightmost number is biggest. <code>−3 &gt; −7</code> (−3 is closer to 0).</p>
            <h3>Subtraction as distance / temperature differences</h3>
            <p>"How much warmer was 65°F than −28°F?" → <code>65 − (−28) = 65 + 28 = 93°</code>.</p>
        `,
        questions: [
            { type: "numeric", question: "On a winter morning it's −28°F in Anchorage and 65°F in Miami. How many degrees warmer was it in Miami?",
              answer: 93,
              explanation: "Difference = 65 − (−28) = 65 + 28 = 93°." },
            { type: "multi", question: "Which of the following represent the OPPOSITE of −3? Choose ALL that apply.",
              options: ["−(−3)", "A point at 3 on a number line (between −3 and 3)", "|−3|", "−1/3"],
              answer: [0, 1, 2],
              explanation: "−(−3) = 3. A point at 3 is the opposite. |−3| = 3, which is also the opposite (here they coincide). −1/3 is the reciprocal-with-sign, not the opposite." },
            { type: "multi", question: "Select ALL inequalities that are TRUE.",
              options: ["−3 > −5", "−5 > −3", "−3 < −5", "−5 < −3"],
              answer: [0, 3],
              explanation: "−3 is to the right of −5, so −3 > −5 and −5 < −3." },
            { type: "tf", question: "Mike says: −3 < −7. Is Mike's inequality TRUE?",
              labels: ["True", "False"], answer: 1,
              explanation: "False. −3 is greater than −7 because −3 is to the right of −7 on the number line." },
            { type: "numeric", question: "What is |−12|?",
              answer: 12,
              explanation: "Absolute value is distance from 0: |−12| = 12." },
            { type: "numeric", question: "What is the opposite of 7?",
              answer: -7,
              explanation: "The opposite of a number flips its sign: opposite of 7 is −7." }
        ]
    },

    "9 — Coordinate Plane (6.NS.6, 6.NS.8)": {
        lesson: `
            <h3>Quadrants</h3>
            <p>The xy-plane has 4 quadrants:</p>
            <table style="border-collapse:collapse;margin:8px 0;">
                <tr><th style="padding:4px 12px;">Quadrant</th><th style="padding:4px 12px;">x</th><th style="padding:4px 12px;">y</th></tr>
                <tr><td style="padding:4px 12px;">I</td><td style="padding:4px 12px;">+</td><td style="padding:4px 12px;">+</td></tr>
                <tr><td style="padding:4px 12px;">II</td><td style="padding:4px 12px;">−</td><td style="padding:4px 12px;">+</td></tr>
                <tr><td style="padding:4px 12px;">III</td><td style="padding:4px 12px;">−</td><td style="padding:4px 12px;">−</td></tr>
                <tr><td style="padding:4px 12px;">IV</td><td style="padding:4px 12px;">+</td><td style="padding:4px 12px;">−</td></tr>
            </table>
            <h3>Reflections</h3>
            <ul>
                <li>Reflect across the <b>x-axis</b> → flip the sign of <i>y</i>: <code>(7, 4) → (7, −4)</code>.</li>
                <li>Reflect across the <b>y-axis</b> → flip the sign of <i>x</i>: <code>(7, 4) → (−7, 4)</code>.</li>
            </ul>
            <h3>Distance between points on a horizontal/vertical line</h3>
            <p>Same y-coordinate → horizontal distance = <code>|x₁ − x₂|</code> or equivalently <code>|x₁| + |x₂|</code> if the points are on opposite sides of 0.</p>
            <p>Example: A(−6, 4) and B(3, 4) → distance = <code>|−6| + |3| = 9</code> (they're on opposite sides of the y-axis).</p>
            ${mathShapes.coordinatePlane({range:6, points:[{x:-6,y:4,label:'A'},{x:3,y:4,label:'B'}]})}
        `,
        questions: [
            { type: "mc", question: "Point V is at (7, 4). Point W is the reflection of V across the x-axis. In which quadrant is W?",
              image: mathShapes.coordinatePlane({range:8, points:[{x:7,y:4,label:'V'},{x:7,y:-4,label:'W'}]}),
              options: ["Quadrant I", "Quadrant II", "Quadrant III", "Quadrant IV"], answer: 3,
              explanation: "Reflection across x-axis flips the y-sign: (7, 4) → (7, −4). x positive, y negative = Quadrant IV." },
            { type: "mc", question: "Point E is on a number line between −2 and −1, closer to −2 (about 4/5 of the way from −1 to −2). Best estimate?",
              options: ["−1.8", "−1.6", "−1.5", "−1.3"], answer: 0,
              explanation: "Closer to −2 than to −1, near the −2 end → about −1.8." },
            { type: "mc", question: "Point A is at (−6, 4) and Point B is at (3, 4). Which expression gives the distance between A and B?",
              options: ["|−6| + |3|", "|3| − |−6|", "|−6| + |−4|", "|4| − |−6|"], answer: 0,
              explanation: "Same y, so horizontal distance. The points are on opposite sides of the y-axis, so add the absolute values: |−6| + |3| = 9." },
            { type: "multi", question: "Point G is at (3, −1). Which of these points is exactly 5 units from G? (Choose ALL that apply — there can be more than one.)",
              options: ["(3, 4)", "(−2, −1)", "(8, −1)", "(3, −6)"],
              answer: [0, 1, 2, 3],
              explanation: "All four are 5 units away: up 5 → (3,4); left 5 → (−2,−1); right 5 → (8,−1); down 5 → (3,−6)." },
            { type: "numeric", question: "The point (−4, 7) is reflected across the y-axis. What is the new x-coordinate?",
              answer: 4,
              explanation: "Reflecting across the y-axis flips x: −4 → 4. The point becomes (4, 7)." },
            { type: "tf", question: "The point (5, −2) is in Quadrant IV.",
              labels: ["True", "False"], answer: 0,
              explanation: "True. x positive (+5), y negative (−2) → Quadrant IV." }
        ]
    },

    // =====================================================================
    // 6.RP — RATIOS & PROPORTIONAL RELATIONSHIPS
    // =====================================================================

    "10 — Ratios & Unit Rate (6.RP.1–3)": {
        lesson: `
            <h3>Ratios</h3>
            <p>A ratio compares two quantities. <code>5 : 3</code> means "5 of one thing for every 3 of another".</p>
            <p><b>Sand : Cement = 5 : 3</b> means the mixture has 5 parts sand + 3 parts cement = 8 parts total.</p>
            <p>If you make 160 ft³ of concrete: each "part" = 160 ÷ 8 = 20 ft³. Cement = 3 parts × 20 = <b>60 ft³</b>.</p>
            <h3>Ratio tables</h3>
            <p>Multiply both columns by the same factor to find missing values. If 8 tea bags → 2 quarts, then 24 tea bags (×3) → 6 quarts.</p>
            <h3>Unit rate</h3>
            <p>A rate per <b>1 unit</b>. Divide!</p>
            <ul>
                <li>20 miles in 150 min → 20/150 = 0.133 mile/min, or 150/20 = 7.5 min/mile.</li>
                <li>Convert to mph: 0.133 mi/min × 60 min/hr = <b>8 mph</b>.</li>
            </ul>
            <h3>Proportions</h3>
            <p>Two equal ratios. Solve by cross-multiplying or scaling: if 20 mi / 150 min, then for 6 miles: <code>(20/150) = (6/x)</code> → <code>x = 150·6/20 = 45 min</code>.</p>
        `,
        questions: [
            { type: "numeric", question: "Concrete is sand : cement = 5 : 3. To make 160 ft³ of concrete, how many cubic feet of CEMENT are needed?",
              answer: 60,
              explanation: "Total parts = 5+3 = 8. Each part = 160/8 = 20. Cement = 3×20 = 60 ft³." },
            { type: "mc", question: "A ratio table: 8 tea bags → 2 quarts; 16 → 4; 24 → ? ; 36 → 9. What goes with 24 tea bags?",
              options: ["5 quarts", "6 quarts", "7 quarts", "8 quarts"], answer: 1,
              explanation: "Each row scales: 24 = 8×3, so quarts = 2×3 = 6." },
            { type: "numeric", question: "Lin biked 20 miles in 150 minutes at constant speed. How far did she ride in 15 minutes? (miles)",
              answer: 2,
              explanation: "Unit rate = 20/150 = 2/15 mile per min. In 15 min: 15 × (2/15) = 2 miles. (Or: 15 is 1/10 of 150, so 1/10 of 20 = 2.)" },
            { type: "numeric", question: "Lin biked 20 miles in 150 minutes. How long did 6 miles take? (minutes)",
              answer: 45,
              explanation: "150 / 20 = 7.5 min per mile. 6 × 7.5 = 45 min." },
            { type: "numeric", question: "Lin biked 20 miles in 150 minutes. How fast in MILES PER HOUR?",
              answer: 8,
              explanation: "150 min = 2.5 hr. 20 / 2.5 = 8 mph." },
            { type: "numeric", question: "Lin biked 20 miles in 150 minutes. What was her pace in MINUTES PER MILE?",
              answer: 7.5, tolerance: 0.01,
              explanation: "150 ÷ 20 = 7.5 minutes per mile." },
            { type: "multi", question: "Ty rode the escalator for 30 seconds and traveled 12 meters. Choose ALL TRUE statements.",
              options: ["He traveled 2 meters every 5 seconds.", "Every 10 seconds he traveled 4 meters.", "He traveled 2.5 meters per second.", "He traveled 0.4 meters per second.", "Every 25 seconds he traveled 7 meters."],
              answer: [0, 1, 3],
              explanation: "Rate = 12/30 = 0.4 m/s. So 2 m every 5s ✓, 4 m every 10s ✓, 0.4 m/s ✓. (10 m every 25s, NOT 7. 0.4 m/s, not 2.5.)" }
        ]
    },

    "11 — Percent Problems (6.RP.3c)": {
        lesson: `
            <h3>Percent basics</h3>
            <p><b>Percent</b> means "per hundred". <code>25% = 25/100 = 0.25</code>.</p>
            <h3>Three percent question types</h3>
            <ol>
                <li><b>Find the percent of a number:</b> 3% of $450 = 0.03 × 450 = $13.50.</li>
                <li><b>What percent is one number of another:</b> 112 of 320 → 112/320 = 0.35 = 35%.</li>
                <li><b>Find the original from the percent:</b> Sale = 80% of original. Sale + 5 = original → set up two equations.</li>
            </ol>
            <h3>Sales tax</h3>
            <p>Total = price + tax. Or shortcut: total = price × (1 + rate). $450 + 3% tax = $450 × 1.03 = $463.50.</p>
            <h3>Discounts</h3>
            <p>20% off → you pay 80%. So sale = 0.80 × original.</p>
        `,
        questions: [
            { type: "numeric", question: "Selena bought a shirt that was 20% less than the original price. The original price was $5 more than the sale price. What was the original price? (dollars)",
              answer: 25,
              explanation: "Let original = x. Sale = 0.80x. Original = sale + 5 → x = 0.80x + 5 → 0.20x = 5 → x = $25." },
            { type: "numeric", question: "Lissie's goal is to save $320. She has saved $112. What PERCENT of her goal has she saved?",
              answer: 35,
              explanation: "112 / 320 = 0.35 = 35%." },
            { type: "numeric", question: "Kendall bought a vase priced at $450. With 3% sales tax, how much did she pay TOTAL? (dollars)",
              answer: 463.5, tolerance: 0.01,
              explanation: "Tax = 0.03 × 450 = $13.50. Total = 450 + 13.50 = $463.50." },
            { type: "numeric", question: "What is 25% of 80?",
              answer: 20,
              explanation: "0.25 × 80 = 20." },
            { type: "numeric", question: "15 is what percent of 60?",
              answer: 25,
              explanation: "15/60 = 0.25 = 25%." },
            { type: "numeric", question: "A jacket is 30% off and costs $42 on sale. What was the original price? (dollars)",
              answer: 60,
              explanation: "Sale = 70% of original → 0.70x = 42 → x = 42/0.70 = $60." },
            { type: "tf", question: "20% off a $50 item leaves a sale price of $40.",
              labels: ["True", "False"], answer: 0,
              explanation: "True. 20% of 50 = 10. Sale = 50 − 10 = $40." }
        ]
    },

    // =====================================================================
    // 6.G — GEOMETRY
    // =====================================================================

    "12 — Area of Polygons (6.G.1)": {
        lesson: `
            <h3>Area formulas</h3>
            <ul>
                <li><b>Rectangle:</b> A = length × width</li>
                <li><b>Triangle:</b> A = ½ × base × height</li>
                <li><b>Parallelogram:</b> A = base × height</li>
                <li><b>Trapezoid:</b> A = ½ × (b₁ + b₂) × h &nbsp; (where b₁ and b₂ are the two parallel sides)</li>
            </ul>
            <h4>Rectangle</h4>
            ${mathShapes.rectangle({widthLabel:'length', heightLabel:'width'})}
            <h4>Triangle (any kind)</h4>
            ${mathShapes.triangle({baseLabel:'base', heightLabel:'height'})}
            <h4>Parallelogram</h4>
            ${mathShapes.parallelogram({baseLabel:'base', heightLabel:'height'})}
            <h4>Trapezoid (parallel sides on top and bottom)</h4>
            ${mathShapes.trapezoid({b1Label:'b₁', b2Label:'b₂', heightLabel:'h'})}
            <h4>Three kinds of triangle</h4>
            <p style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">
                <span><b>Right</b>${mathShapes.rightTriangle({})}</span>
                <span><b>Isosceles</b>${mathShapes.isoscelesTriangle({})}</span>
                <span><b>Equilateral</b>${mathShapes.equilateralTriangle({})}</span>
            </p>
            <h3>Composite figures</h3>
            <p>Decompose into rectangles and triangles you know how to calculate, then ADD their areas. (Or surround with a big rectangle and SUBTRACT the missing pieces.)</p>
            <h3>Example — trapezoid with bases 9 and 4.5, height 6</h3>
            <p>A = ½ × (9 + 4.5) × 6 = ½ × 13.5 × 6 = <b>40.5 cm²</b>.</p>
        `,
        questions: [
            { type: "mc", question: "An isosceles trapezoid has parallel sides of 9 cm and 4.5 cm, with a height of 6 cm. What is its area?",
              image: mathShapes.trapezoid({b1Label:'4.5 cm', b2Label:'9 cm', heightLabel:'6 cm'}),
              options: ["27 cm²", "33.8 cm²", "40.5 cm²", "54 cm²"], answer: 2,
              explanation: "A = ½(b₁+b₂)h = ½(9+4.5)(6) = ½(13.5)(6) = 40.5 cm²." },
            { type: "numeric", question: "What is the area of a rectangle with length 12 m and width 7 m? (m²)",
              image: mathShapes.rectangle({widthLabel:'12 m', heightLabel:'7 m'}),
              answer: 84,
              explanation: "A = 12 × 7 = 84 m²." },
            { type: "numeric", question: "Area of a triangle with base 10 in and height 6 in? (in²)",
              image: mathShapes.triangle({baseLabel:'10 in', heightLabel:'6 in'}),
              answer: 30,
              explanation: "A = ½ × 10 × 6 = 30 in²." },
            { type: "numeric", question: "A parallelogram has base 8 cm and height 5 cm. Area? (cm²)",
              image: mathShapes.parallelogram({baseLabel:'8 cm', heightLabel:'5 cm'}),
              answer: 40,
              explanation: "A = base × height = 8 × 5 = 40 cm²." },
            { type: "numeric", question: "A trapezoid has parallel sides 6 ft and 10 ft and height 4 ft. Area? (ft²)",
              image: mathShapes.trapezoid({b1Label:'6 ft', b2Label:'10 ft', heightLabel:'4 ft'}),
              answer: 32,
              explanation: "A = ½(6+10)(4) = ½(16)(4) = 32 ft²." },
            { type: "numeric", question: "A composite figure made of a 4×6 rectangle joined to a triangle with base 4 and height 3 has total area? (square units)",
              answer: 30,
              explanation: "Rectangle: 4×6=24. Triangle: ½×4×3=6. Total: 24+6 = 30 square units." }
        ]
    },

    "13 — Volume & Unit Conversion (6.G.2, 6.G.4)": {
        lesson: `
            <h3>Volume of a rectangular prism</h3>
            <p><code>V = length × width × height</code> &nbsp;(works even with fractional edges).</p>
            ${mathShapes.rectangularPrism({lengthLabel:'length', widthLabel:'width', heightLabel:'height'})}
            <p>Cube: <code>V = s³</code>.</p>
            ${mathShapes.cube({sideLabel:'s'})}
            <h3>"Tank with water X inches below the top"</h3>
            <p>Find the height of the WATER (tank height − empty space), not the tank, then multiply.</p>
            <p>Example: 16 in × 10⅓ in × 22 in tank, water 4 in below top → water height = 22 − 4 = 18 in. V_water = 16 × 10⅓ × 18 = 16 × 31/3 × 18 = 2,976 in³.</p>
            <h3>Unit conversion of AREA — the trap!</h3>
            <p>To convert in² to ft², you divide by <b>144</b> (because 1 ft² = 12 × 12 = 144 in²), NOT by 12.</p>
            <p>Jada's mistake: 2880 in² ÷ 12 = 240. WRONG. Correct: 2880 ÷ 144 = 20 ft².</p>
            <h3>Yards to feet for area</h3>
            <p>1 yard = 3 feet, so 1 yd² = 3 × 3 = 9 ft². Or convert each side first: 35 yd × 50 yd → 105 ft × 150 ft = 15,750 ft².</p>
        `,
        questions: [
            { type: "numeric", question: "Volume of a cube with side length 0.5 inch (decimal form, in³)?",
              image: mathShapes.cube({sideLabel:'0.5 in'}),
              answer: 0.125, tolerance: 0.001,
              explanation: "V = 0.5³ = 0.125 in³." },
            { type: "numeric", question: "A rectangular tank is 16 in wide, 10⅓ in long, 22 in high. Water surface is 4 in below the top. Find the volume of WATER. (in³)",
              image: mathShapes.rectangularPrism({lengthLabel:'10⅓ in', widthLabel:'16 in', heightLabel:'22 in'}),
              answer: 2976, tolerance: 1,
              explanation: "Water height = 22 − 4 = 18 in. V = 16 × (31/3) × 18 = 16 × 18 × 31/3 = 16 × 6 × 31 = 2,976 in³." },
            { type: "tf", question: "Jada says: a board is 60 in × 48 in = 2880 in². To convert to ft², divide by 12, getting 240 ft². Is Jada correct?",
              labels: ["Yes — Jada is right", "No — Jada is wrong"], answer: 1,
              explanation: "No. To convert in² to ft², divide by 144 (since 1 ft² = 144 in²). Correct answer: 2880 ÷ 144 = 20 ft²." },
            { type: "numeric", question: "Dana is buying land that is 35 yards by 50 yards. How many SQUARE FEET is the land?",
              answer: 15750,
              explanation: "Convert sides: 35 yd = 105 ft; 50 yd = 150 ft. Area = 105 × 150 = 15,750 ft². (Or 35×50 yd² × 9 ft²/yd² = 1750 × 9 = 15,750.)" },
            { type: "numeric", question: "A rectangular prism has dimensions 5 cm × 4 cm × 2½ cm. Find its volume (cm³).",
              image: mathShapes.rectangularPrism({lengthLabel:'5 cm', widthLabel:'4 cm', heightLabel:'2½ cm'}),
              answer: 50, tolerance: 0.01,
              explanation: "V = 5 × 4 × 2.5 = 50 cm³." },
            { type: "numeric", question: "How many square inches are in 3 square feet?",
              answer: 432,
              explanation: "1 ft² = 144 in². 3 ft² = 3 × 144 = 432 in²." }
        ]
    },

    // =====================================================================
    // 6.SP — STATISTICS
    // =====================================================================

    "14 — Statistics: Center, Spread & Plots (6.SP.4–5)": {
        lesson: `
            <h3>Measures of center</h3>
            <ul>
                <li><b>Mean</b> = average. Sum of values ÷ how many. Sensitive to outliers.</li>
                <li><b>Median</b> = middle value when sorted. (For even count, average the two middle values.) Resistant to outliers.</li>
                <li><b>Mode</b> = most frequent value.</li>
            </ul>
            <p><b>Pick MEDIAN</b> when there's a big outlier (e.g. Brazil's area dwarfs the other countries).</p>
            <h3>Measures of spread</h3>
            <ul>
                <li><b>Range</b> = max − min</li>
                <li><b>IQR (interquartile range)</b> = Q3 − Q1 = spread of the middle 50%</li>
            </ul>
            <h3>Box plot anatomy</h3>
            <pre>     |---[==Q1==median==Q3==]---|
   min                          max</pre>
            <h3>Dot plots</h3>
            <p>Each X represents one data value. The TALLEST stack = mode. To find the median, count to the middle X.</p>
            <p>Skewed data (long tail one way) → mean is pulled toward the tail; median stays near the cluster.</p>
        `,
        questions: [
            { type: "numeric", question: "Find the mean of: 4, 7, 9, 10, 5",
              answer: 7,
              explanation: "Sum = 35. Count = 5. Mean = 35/5 = 7." },
            { type: "numeric", question: "Find the median of: 12, 4, 9, 18, 6, 11, 8",
              answer: 9,
              explanation: "Sort: 4, 6, 8, 9, 11, 12, 18. Middle (4th) value = 9." },
            { type: "numeric", question: "Find the median of: 3, 8, 5, 10, 12, 7",
              answer: 7.5, tolerance: 0.01,
              explanation: "Sort: 3,5,7,8,10,12. Average of 3rd & 4th: (7+8)/2 = 7.5." },
            { type: "mc", question: "South American country areas range from 176,215 km² (Uruguay) to 8,514,877 km² (Brazil — much larger than the rest). Which measure of CENTER best describes this data?",
              options: ["mean", "median", "mode", "range"], answer: 1,
              explanation: "Brazil is an outlier that pulls the mean way up. The MEDIAN is more representative." },
            { type: "mc", question: "A box plot has Q1 ≈ 500,000 and Q3 ≈ 1,500,000. What is the IQR?",
              options: ["500,000 sq km", "750,000 sq km", "1,000,000 sq km", "8,500,000 sq km"], answer: 2,
              explanation: "IQR = Q3 − Q1 = 1,500,000 − 500,000 = 1,000,000." },
            { type: "multi", question: "Two dot plots are given. Organization scores have counts 1,1,1,2,4,2,1 at 0–6. IDEAS scores have counts 0,1,2,4,3,1,0 at 0–6. Choose ALL TRUE statements.",
              options: ["ORGANIZATION scores are generally higher than IDEAS scores.",
                        "The median score for IDEAS is 5.",
                        "The mode of the ORGANIZATION scores is 3.",
                        "The mean score for IDEAS is lower than the median score."],
              answer: [0],
              explanation: "Org has higher values overall (mode 4) vs IDEAS (mode 3). IDEAS median = 3 (not 5). Org mode is 4 (not 3). IDEAS mean ≈ 3.0 ≈ median 3 (not lower)." },
            { type: "tf", question: "If a dot plot is symmetric, the mean and median are approximately equal.",
              labels: ["True", "False"], answer: 0,
              explanation: "True. In a symmetric distribution, mean ≈ median." },
            { type: "mc", question: "Which measure is MOST affected by an outlier?",
              options: ["Median", "Mode", "Mean", "IQR"], answer: 2,
              explanation: "The mean uses every value, so a single extreme value pulls it. Median, mode, and IQR are resistant." }
        ]
    }
};
