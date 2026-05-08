// Supplementary question bank — merged with math-practice-data.js
// Same topic keys; questions added to the pool for random sampling.
const mathPracticeBank = {
    "Day 1 — Order of Operations (6.EE.1)": [
        { type: "mc", question: "18 ÷ 3 + 2 × 5 = ?", options: ["16", "30", "40", "11"], answer: 0, explanation: "Divide and multiply first: 6 + 10 = 16." },
        { type: "mc", question: "(4 + 6)² ÷ 5 = ?", options: ["20", "10", "200", "4"], answer: 0, explanation: "Parentheses: 10. Exponent: 100. Divide: 100 ÷ 5 = 20." },
        { type: "mc", question: "2³ × 3 − 4 = ?", options: ["20", "12", "8", "44"], answer: 0, explanation: "Exponent first: 8 × 3 = 24, then 24 − 4 = 20." },
        { type: "mc", question: "3 + 4 × 2² = ?", options: ["19", "28", "49", "16"], answer: 0, explanation: "Exponent first: 2² = 4. Then 4 × 4 = 16. Add 3 → 19." },
        { type: "mc", question: "12 + 8 ÷ 4 − 3 = ?", options: ["11", "2", "8", "9"], answer: 0, explanation: "Divide first: 8 ÷ 4 = 2. Then 12 + 2 − 3 = 11." },
        { type: "mc", question: "5(2 + 3) − 10 = ?", options: ["15", "5", "0", "25"], answer: 0, explanation: "Inside parens: 5. 5 × 5 = 25. 25 − 10 = 15." },
        { type: "numeric", question: "Evaluate: (15 − 3) ÷ 4 + 2²", answer: 7, explanation: "Parens: 12. ÷4 = 3. 2² = 4. 3 + 4 = 7." },
        { type: "numeric", question: "Evaluate: 30 − 2 × 3²", answer: 12, explanation: "Exponent: 9. Multiply: 18. Subtract: 30 − 18 = 12." },
        { type: "tf", question: "20 − 4 × 2 equals 32.", labels: ["True", "False"], answer: 1, explanation: "Multiply first: 8. Then 20 − 8 = 12, not 32." }
    ],
    "Day 2 — Translating & Equivalent Expressions (6.EE.2–4)": [
        { type: "mc", question: "Which expression means \"5 less than y\"?", options: ["y − 5", "5 − y", "y + 5", "5y"], answer: 0, explanation: "\"Less than\" reverses order: y minus 5." },
        { type: "mc", question: "Write \"the product of 3 and the sum of n and 2\".", options: ["3(n + 2)", "3n + 2", "3 + n + 2", "3n × 2"], answer: 0, explanation: "Product means multiply; the sum (n + 2) is in parentheses." },
        { type: "multi", question: "Choose ALL expressions equivalent to 6x + 12.", options: ["6(x + 2)", "3(2x + 4)", "2(3x + 6)", "6x + 2", "6 + 2x"], answer: [0, 1, 2], explanation: "Distribute each: 6(x+2)=6x+12 ✓, 3(2x+4)=6x+12 ✓, 2(3x+6)=6x+12 ✓. The other two are different." },
        { type: "mc", question: "Simplify 4(2y + 3).", options: ["8y + 12", "8y + 3", "6y + 7", "2y + 12"], answer: 0, explanation: "Distribute 4: 4·2y + 4·3 = 8y + 12." },
        { type: "tf", question: "5(a + b) equals 5a + 5b for all numbers a and b.", labels: ["True", "False"], answer: 0, explanation: "That's the distributive property — true for all values." },
        { type: "numeric", question: "Evaluate 3a + b when a = 4 and b = 5.", answer: 17, explanation: "3·4 + 5 = 12 + 5 = 17." },
        { type: "numeric", question: "Evaluate x² − 2x when x = 5.", answer: 15, explanation: "25 − 10 = 15." },
        { type: "mc", question: "Which is \"twice a number n, increased by 7\"?", options: ["2n + 7", "n + 7 + 2", "2(n + 7)", "7 − 2n"], answer: 0, explanation: "Twice n is 2n; increased by 7 adds 7 → 2n + 7." }
    ],
    "Day 3 — One-Step Equations (6.EE.5, 6.EE.7)": [
        { type: "numeric", question: "Solve: x + 8 = 14", answer: 6, explanation: "Subtract 8 from both sides: x = 6." },
        { type: "numeric", question: "Solve: x − 5 = 12", answer: 17, explanation: "Add 5 to both sides: x = 17." },
        { type: "numeric", question: "Solve: 3x = 21", answer: 7, explanation: "Divide by 3: x = 7." },
        { type: "numeric", question: "Solve: x ÷ 4 = 9", answer: 36, explanation: "Multiply both sides by 4: x = 36." },
        { type: "numeric", question: "Solve: 0.5x = 4", answer: 8, explanation: "Divide by 0.5 (or multiply by 2): x = 8." },
        { type: "numeric", question: "Solve: (2/3)x = 10", answer: 15, explanation: "Multiply by 3/2: x = 10 · 3/2 = 15." },
        { type: "mc", question: "Which value is a solution of x + 7 = 13?", options: ["6", "7", "20", "−6"], answer: 0, explanation: "13 − 7 = 6, and 6 + 7 = 13 ✓." },
        { type: "tf", question: "x = 5 is a solution of 2x = 12.", labels: ["True", "False"], answer: 1, explanation: "2 · 5 = 10, not 12. The solution is x = 6." }
    ],
    "Day 4 — Inequalities (6.EE.8)": [
        { type: "mc", question: "Which value is a solution of x > 5?", options: ["6", "5", "4", "−5"], answer: 0, explanation: "Greater than 5 (strict) — only 6 qualifies; 5 itself is not greater than 5." },
        { type: "tf", question: "x ≥ 4 means x can equal 4.", labels: ["True", "False"], answer: 0, explanation: "The line under ≥ means \"or equal to,\" so 4 is included." },
        { type: "multi", question: "Choose ALL numbers that satisfy x ≤ 2.", options: ["−1", "0", "2", "3", "4"], answer: [0, 1, 2], explanation: "≤ 2 includes 2 itself and everything below: −1, 0, 2 ✓." },
        { type: "mc", question: "Which inequality matches: \"the temperature t is at least 32\"?", options: ["t ≥ 32", "t > 32", "t ≤ 32", "t < 32"], answer: 0, explanation: "\"At least\" includes the value itself, so use ≥." },
        { type: "mc", question: "Which inequality matches: \"no more than 50 students\"?", options: ["s ≤ 50", "s < 50", "s ≥ 50", "s > 50"], answer: 0, explanation: "\"No more than\" means at most 50 — that's ≤." },
        { type: "numeric", question: "What is the smallest whole number that satisfies x > 7?", answer: 8, explanation: "x must be greater than 7, and the smallest whole number greater than 7 is 8." },
        { type: "numeric", question: "What is the largest whole number that satisfies x ≤ 9?", answer: 9, explanation: "≤ allows 9 itself, so the largest whole number is 9." }
    ],
    "Day 5 — Variables, Tables & Equations (6.EE.9)": [
        { type: "numeric", question: "If y = 2x + 1, what is y when x = 4?", answer: 9, explanation: "2·4 + 1 = 9." },
        { type: "numeric", question: "If y = x − 3 and x = 10, what is y?", answer: 7, explanation: "10 − 3 = 7." },
        { type: "mc", question: "A table shows (1,5), (2,8), (3,11). Which equation fits?", options: ["y = 3x + 2", "y = x + 4", "y = 5x", "y = 2x + 3"], answer: 0, explanation: "Each x increase of 1 adds 3 to y → slope 3. Check: 3·1+2=5 ✓, 3·2+2=8 ✓." },
        { type: "numeric", question: "A car travels at 60 mph. Distance d = 60t. After 2.5 hours, what is d (miles)?", answer: 150, unit: "mi", explanation: "60 · 2.5 = 150 mi." },
        { type: "mc", question: "In d = 60t, which is the independent variable?", options: ["t (time)", "d (distance)", "60", "neither"], answer: 0, explanation: "Time runs on its own; distance depends on time." },
        { type: "numeric", question: "If c = 8h (cost = 8 per hour), what is the cost for 6 hours?", answer: 48, unit: "$", explanation: "8 · 6 = $48." }
    ],
    "Day 6 — Fraction & Decimal Operations (6.NS.1, 6.NS.3)": [
        { type: "mc", question: "3/4 ÷ 1/2 = ?", options: ["1 1/2", "3/8", "2", "1/2"], answer: 0, explanation: "Keep-Change-Flip: 3/4 × 2/1 = 6/4 = 3/2 = 1 1/2." },
        { type: "mc", question: "2/3 × 9/10 = ?", options: ["3/5", "11/13", "18/13", "2/5"], answer: 0, explanation: "Multiply: 18/30. Simplify by 6 → 3/5." },
        { type: "numeric", question: "0.6 + 0.45 = ?", answer: 1.05, explanation: "Line up decimals: 0.60 + 0.45 = 1.05." },
        { type: "numeric", question: "4.2 − 1.85 = ?", answer: 2.35, explanation: "4.20 − 1.85 = 2.35." },
        { type: "numeric", question: "0.7 × 0.4 = ?", answer: 0.28, explanation: "7 × 4 = 28; two decimal places → 0.28." },
        { type: "numeric", question: "3.6 ÷ 0.4 = ?", answer: 9, explanation: "Multiply both by 10: 36 ÷ 4 = 9." },
        { type: "mc", question: "1 1/4 + 2 1/2 = ?", options: ["3 3/4", "3 1/4", "3 2/6", "4"], answer: 0, explanation: "1/4 + 2/4 = 3/4; 1 + 2 = 3 → 3 3/4." }
    ],
    "Day 7 — GCF, LCM & Distributive (6.NS.4)": [
        { type: "numeric", question: "Find the GCF of 24 and 36.", answer: 12, explanation: "Common factors: 1,2,3,4,6,12. Greatest is 12." },
        { type: "numeric", question: "Find the LCM of 6 and 8.", answer: 24, explanation: "Multiples of 8: 8,16,24. 24 ÷ 6 = 4 ✓. Smallest common is 24." },
        { type: "numeric", question: "Find the GCF of 18 and 30.", answer: 6, explanation: "18 = 2·3², 30 = 2·3·5. Common: 2·3 = 6." },
        { type: "numeric", question: "Find the LCM of 4 and 9.", answer: 36, explanation: "4 and 9 share no factors, so LCM = 4 × 9 = 36." },
        { type: "mc", question: "Use the GCF to rewrite 24 + 36.", options: ["12(2 + 3)", "6(4 + 6)", "4(6 + 9)", "12(1 + 3)"], answer: 0, explanation: "GCF of 24 and 36 is 12. 24 = 12·2, 36 = 12·3 → 12(2 + 3)." },
        { type: "numeric", question: "Find the GCF of 15 and 25.", answer: 5, explanation: "Both end in 5; GCF = 5." }
    ],
    "Day 8 — Integers & Absolute Value (6.NS.5–7)": [
        { type: "numeric", question: "What is |−7|?", answer: 7, explanation: "Absolute value is distance from 0 — always non-negative." },
        { type: "mc", question: "Which is greater: −3 or −8?", options: ["−3", "−8", "They are equal", "Cannot tell"], answer: 0, explanation: "On a number line, −3 is to the right of −8, so −3 > −8." },
        { type: "mc", question: "Order from least to greatest: −2, 5, −7, 0", options: ["−7, −2, 0, 5", "−2, −7, 0, 5", "5, 0, −2, −7", "0, −2, −7, 5"], answer: 0, explanation: "Most-negative comes first: −7, then −2, then 0, then 5." },
        { type: "mc", question: "What is the opposite of 6?", options: ["−6", "0", "1/6", "6"], answer: 0, explanation: "Opposites are the same distance from 0 on the other side." },
        { type: "numeric", question: "On a number line, what is the distance from −4 to 3?", answer: 7, explanation: "From −4 to 0 is 4, then 0 to 3 is 3. Total 7." },
        { type: "tf", question: "|−5| = −5", labels: ["True", "False"], answer: 1, explanation: "Absolute value is never negative. |−5| = 5." },
        { type: "tf", question: "Every negative integer is less than every positive integer.", labels: ["True", "False"], answer: 0, explanation: "Yes — negatives are left of 0 on the number line, positives to the right." }
    ],
    "Day 9 — Coordinate Plane (6.NS.6, 6.NS.8)": [
        { type: "mc", question: "In which quadrant is the point (−3, 4)?", options: ["II", "I", "III", "IV"], answer: 0, explanation: "Negative x, positive y → upper-left → Quadrant II." },
        { type: "mc", question: "Reflect (5, −2) over the x-axis. What are the new coordinates?", options: ["(5, 2)", "(−5, −2)", "(−5, 2)", "(2, 5)"], answer: 0, explanation: "Reflecting over the x-axis flips the y-sign: (5, −2) → (5, 2)." },
        { type: "numeric", question: "Distance from (2, 3) to (2, 8) on the coordinate plane?", answer: 5, explanation: "Same x, so subtract y-values: 8 − 3 = 5." },
        { type: "mc", question: "Which point lies on the y-axis?", options: ["(0, 7)", "(3, 0)", "(−2, 5)", "(4, 4)"], answer: 0, explanation: "Points on the y-axis have x = 0." },
        { type: "mc", question: "(−4, −1) is in which quadrant?", options: ["III", "II", "IV", "I"], answer: 0, explanation: "Both coordinates negative → lower-left → Quadrant III." },
        { type: "numeric", question: "Distance from (−3, 5) to (4, 5)?", answer: 7, explanation: "Same y, so subtract x-values: 4 − (−3) = 7." }
    ],
    "Day 10 — Ratios & Unit Rate (6.RP.1–3)": [
        { type: "mc", question: "Simplify the ratio 12 : 18.", options: ["2 : 3", "3 : 2", "6 : 9", "1 : 2"], answer: 0, explanation: "Divide both by 6: 12÷6 : 18÷6 = 2 : 3." },
        { type: "numeric", question: "A car drives 240 miles in 4 hours. What is the unit rate (mph)?", answer: 60, unit: "mph", explanation: "240 ÷ 4 = 60 mph." },
        { type: "numeric", question: "3 apples cost $1.50. How much do 7 apples cost (in dollars)?", answer: 3.50, tolerance: 0.01, unit: "$", explanation: "Per apple: $0.50. 7 × $0.50 = $3.50." },
        { type: "numeric", question: "Ratio 5 : 8. If 5 corresponds to 20, what does 8 correspond to?", answer: 32, explanation: "Multiplier is 4 (5·4 = 20), so 8·4 = 32." },
        { type: "numeric", question: "For every 4 cars there are 3 trucks. If there are 12 trucks, how many cars?", answer: 16, explanation: "12 trucks = 3 · 4 (4 groups). So cars = 4 · 4 = 16." },
        { type: "mc", question: "Which is a better deal: 6 for $9, or 8 for $10?", options: ["8 for $10", "6 for $9", "Same", "Cannot tell"], answer: 0, explanation: "$9 ÷ 6 = $1.50 each; $10 ÷ 8 = $1.25 each. The 8-pack is cheaper per item." }
    ],
    "Day 11 — Percent Problems (6.RP.3c)": [
        { type: "numeric", question: "What is 20% of 50?", answer: 10, explanation: "20% = 0.20. 0.20 × 50 = 10." },
        { type: "numeric", question: "What is 75% of 80?", answer: 60, explanation: "75% = 3/4. 3/4 × 80 = 60." },
        { type: "numeric", question: "15 is what percent of 60?", answer: 25, unit: "%", explanation: "15/60 = 0.25 = 25%." },
        { type: "numeric", question: "8 is 40% of what number?", answer: 20, explanation: "8 ÷ 0.40 = 20." },
        { type: "numeric", question: "A $40 item is 25% off. What is the sale price (in dollars)?", answer: 30, unit: "$", explanation: "Discount: 25% of 40 = 10. Pay 40 − 10 = $30." },
        { type: "numeric", question: "A $200 item has 8% sales tax. What is the total (in dollars)?", answer: 216, unit: "$", explanation: "Tax: 8% × 200 = 16. Total: 200 + 16 = $216." },
        { type: "mc", question: "Which is greatest?", options: ["80%", "0.7", "3/4", "0.65"], answer: 0, explanation: "80% = 0.80; 3/4 = 0.75; 0.7 = 0.70; 0.65. Largest is 0.80." }
    ],
    "Day 12 — Area of Polygons (6.G.1)": [
        { type: "numeric", question: "Triangle with base 10 and height 6. Area?", image: mathShapes.triangle({baseLabel:'10', heightLabel:'6'}), answer: 30, unit: "sq units", explanation: "A = (1/2) · 10 · 6 = 30." },
        { type: "numeric", question: "Parallelogram with base 8 and height 5. Area?", image: mathShapes.parallelogram({baseLabel:'8', heightLabel:'5'}), answer: 40, unit: "sq units", explanation: "A = b · h = 8 · 5 = 40." },
        { type: "numeric", question: "Trapezoid with parallel sides 4 and 6 and height 3. Area?", image: mathShapes.trapezoid({b1Label:'4', b2Label:'6', heightLabel:'3'}), answer: 15, unit: "sq units", explanation: "A = (1/2)(b1 + b2)·h = (1/2)(4 + 6)(3) = 15." },
        { type: "numeric", question: "Square with side length 7. Area?", image: mathShapes.square({sideLabel:'7'}), answer: 49, unit: "sq units", explanation: "A = s² = 49." },
        { type: "numeric", question: "Rectangle 12 by 5. Area?", image: mathShapes.rectangle({widthLabel:'12', heightLabel:'5'}), answer: 60, unit: "sq units", explanation: "A = 12 · 5 = 60." },
        { type: "tf", question: "The area of a triangle is base times height.", labels: ["True", "False"], answer: 1, explanation: "It's HALF of base times height: A = (1/2)·b·h." }
    ],
    "Day 13 — Volume & Unit Conversion (6.G.2, 6.G.4)": [
        { type: "numeric", question: "Rectangular prism 2 × 3 × 5. Volume?", image: mathShapes.rectangularPrism({lengthLabel:'5', widthLabel:'3', heightLabel:'2'}), answer: 30, unit: "cu units", explanation: "V = l·w·h = 2·3·5 = 30." },
        { type: "numeric", question: "Cube with side 4. Volume?", image: mathShapes.cube({sideLabel:'4'}), answer: 64, unit: "cu units", explanation: "V = s³ = 4³ = 64." },
        { type: "numeric", question: "Cube with side 1/2. Volume (as a decimal)?", image: mathShapes.cube({sideLabel:'1/2'}), answer: 0.125, tolerance: 0.001, explanation: "(1/2)³ = 1/8 = 0.125." },
        { type: "numeric", question: "Convert: 60 inches = ? feet", answer: 5, unit: "ft", explanation: "12 in = 1 ft, so 60 ÷ 12 = 5 ft." },
        { type: "numeric", question: "Convert: 2.5 m = ? cm", answer: 250, unit: "cm", explanation: "1 m = 100 cm, so 2.5 × 100 = 250 cm." },
        { type: "numeric", question: "Convert: 3 lbs = ? oz", answer: 48, unit: "oz", explanation: "1 lb = 16 oz, so 3 × 16 = 48 oz." },
        { type: "numeric", question: "Convert: 5,000 mL = ? L", answer: 5, unit: "L", explanation: "1 L = 1000 mL, so 5000 ÷ 1000 = 5 L." }
    ],
    "Day 14 — Statistics: Center, Spread & Plots (6.SP.4–5)": [
        { type: "numeric", question: "Median of 3, 5, 7, 9, 11?", answer: 7, explanation: "Middle of 5 ordered numbers is the 3rd: 7." },
        { type: "numeric", question: "Mean of 4, 6, 8, 10, 12?", answer: 8, explanation: "Sum = 40; 40 ÷ 5 = 8." },
        { type: "numeric", question: "Range of 12, 7, 18, 4, 9?", answer: 14, explanation: "Max 18, min 4. 18 − 4 = 14." },
        { type: "numeric", question: "Mode of 2, 3, 3, 5, 7, 3, 9?", answer: 3, explanation: "3 appears most often (three times)." },
        { type: "numeric", question: "Median of 2, 5, 7, 8?", answer: 6, explanation: "Even count → average the two middles: (5 + 7) ÷ 2 = 6." },
        { type: "mc", question: "Which measure is best for a strongly skewed data set?", options: ["Median", "Mean", "Mode", "Range"], answer: 0, explanation: "Median is resistant to outliers; mean gets pulled by extreme values." },
        { type: "tf", question: "Adding a very large outlier increases the mean more than the median.", labels: ["True", "False"], answer: 0, explanation: "True. The median barely shifts; the mean reflects the outlier." }
    ]
};
