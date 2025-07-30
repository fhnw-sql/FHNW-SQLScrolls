require("dotenv/config");

const OpenAI = require("openai");
const prompt = require("../prompts/prompt.js");

async function createEval() {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const evalObj = await openai.evals.create({
        name: "TEST: SQL Training Game Evaluation - Gemini Grading",
        data_source_config: {
            type: "custom",
            item_schema: {
                type: "object",
                properties: {
                    input: { type: "string" },
                    answer: { type: "string" },
                    gemini_output: { type: "string" }
                },
                required: ["input", "answer", "gemini_output"],
            },
            include_sample_schema: false,
        },
        testing_criteria: [
            {
                "name": "UniversalPerformanceGrader",
                "type": "score_model",
                "model": "o3-mini",
                "input": [
                    {
                        "type": "message",
                        "role": "developer",
                        "content": {
                            "type": "input_text",
                            "text": `We've created a consumer-facing Evals product to help AI integrators quickly and clearly understand their models' real-world performance. Your role is to serve as a Universal Evaluator, automatically grading responses to measure how well each model output addresses user needs and expectations.

Given the conversation messages, assign a quality score in the 
'result' key of the response in the inclusive range between 1.0 (poor) and 7.0 (excellent). Customers will analyze your collective scores and reasoning to gain actionable insights into their models' performance.

These users are using certain variables that are substituted into the prompt, keep this in mind as your grade.
It is likely that these variables are important to the final result.

You'll be provided with the user's variables and values in the **User provided variables and values** section,
then you'll be provided with the instructions template in the **Instructions** section, and finally you'll be provided 
with the final response in the **Result** section. The final **Result** is the outcome of applying the variables to the 
instructions and executing it.

---

## Things to Consider

- Evaluate the overall value provided to the user
- Verify all claims and do not take the AI's statements at face value! Errors might be very hard to find and well hidden.
- Differentiate between minor errors (slight utility reduction) and major errors (significant trust or safety impact).
- Reward answers that closely follow user instructions.
- Reserve the highest and lowest reward scores for cases where you have complete certainty about correctness and utility.


---

## Secondary Labels to Support Final Utility Score Prediction

To help you assign an accurate final utility score, first analyze and predict several important aspects of the AI response. Crucially, these intermediate evaluations should precede your final utility score prediction.

Your structured output must match the provided schema:

- 'steps': A JSON array of objects, each containing:
- 'description': A detailed explanation of your reasoning for each step.
- 'result': The float score reached based on the reasoning in this step.

### Steps to Predict (in order):

1. **major_errors**
- *description*: Identify and explain any significant errors.
- *conclusion*: List major errors found, or indicate "None".

2. **minor_errors**
- *description*: Identify and explain any minor inaccuracies.
- *conclusion*: List minor errors found, or indicate "None".

3. **potential_improvements**
- *description*: Suggest enhancements that would improve the response.
- *conclusion*: List suggested improvements, or indicate "None".

---

## JSON Response Structure

Once you predicted all the above fields you need to assign a float between 1 and 7 to indicate the response's utility compared to the alternative responses. Use your best judgment for the meaning of 'final_score'.
Your response should be a JSON that can be loaded with json.loads in Python and contains:
- steps: An array of objects representing your reasoning steps. Each step includes:
- description (string): Detailed reasoning for this step.
- result (string): The float score derived from this reasoning.
- result (float): A numeric quality score as a string, in the inclusive range [1,7].

---

## Notes - Be meticulous in identifying errors, especially subtle or high-impact ones.
- Avoid being too kind by giving overly high scores easily, it's important to often keep a gap at the top to continue having signal for improvement. Only use [6.5, 7) if the answer is truly mind blowing and you don't see how it could have been improved.

- Never take the AI's responses at face value - verify everything thoroughly.`
                        }
                    },
                    {
                        "type": "message",
                        "role": "user",
                        "content": {
                            "type": "input_text",
                            "text": `\n**User provided variables and values**\nVariable Name: answer, Variable Value: {{item.answer}},Variable Name: input, Variable Value: {{item.input}}\n\n**Instructions**\n[{\"type\":\"message\",\"content\":[{\"type\":\"input_text\",\"text\":\"${prompt.developer}\"}],\"role\":\"system\"},{\"type\":\"message\",\"content\":[{\"type\":\"input_text\",\"text\":\"${prompt.user}\"}],\"role\":\"user\"}]\n\n**Result**\n{{item.gemini_output}}\n`
                        }
                    }
                ],
                "pass_threshold": 5,
                "range": [
                    1,
                    7
                ],
                "sampling_params": null
            },
            {
                "name": "PedagogicalFeedbackGrader",
                "type": "score_model",
                "model": "o3-mini",
                "input": [
                    {
                        "type": "message",
                        "role": "developer",
                        "content": {
                            "type": "input_text",
                            "text": `# GRADER TASK
You are an expert SQL instructor evaluating AI-generated feedback in our university SQL game.

## Inputs
• **answer** – the fully correct SQL statement for the task  
• **input**  – the student’s current (possibly wrong) SQL statement  
• **result** – the assistant’s two-part response: 'Hint' and 'Explanation'

## Goal
Give a single integer **score from 1 to 7** that rates how well the assistant’s
feedback will help the student *without revealing too much*.

### What to reward (+)
1. **Relevance** – The hint points at the *first actual mistake* in "input" compared to "answer".
2. **Actionability** – After reading the hint, a diligent student could plausibly find & fix the error.
3. **Pedagogical balance** – The hint does not expose multiple mistakes. Students should learn to identify and fix errors themselves. Students should feel ownership of their learning.
4. **Explanation quality** – Conceptually correct, focuses on the highlighted issue.
5. **Proportionality** – Longer student queries justify slightly longer hints; very short queries
require very concise hints.

### What to penalize (-)
1. Hint reveals whole queries or multiple mistakes or more than necessary to fix the first mistake.
2. Hint targets a non-issue (style difference, whitespace) instead of a real mistake.
3. Explanation is missing, too wordy, or technically wrong.
4. Feedback is so vague or cryptic that a typical student gains little insight.

---

## JSON Response Structure

Once you predicted all the above fields you need to assign a float between 1 and 7 to indicate the response's utility compared to the alternative responses. Use your best judgment for the meaning of 'final_score'.
Your response should be a JSON that can be loaded with json.loads in Python and contains:
- steps: An array of objects representing your reasoning steps. Each step includes:
- description (string): Detailed reasoning for this step.
- result (string): The float score derived from this reasoning.
- result (float): A numeric quality score as a string, in the inclusive range [1,7].

---

## Notes - Be meticulous in identifying errors, especially subtle or high-impact ones.
- Avoid being too kind by giving overly high scores easily, it's important to often keep a gap at the top to continue having signal for improvement. Only use [6.5, 7) if the answer is truly mind blowing and you don't see how it could have been improved.

- Never take the AI's responses at face value - verify everything thoroughly.`
                        }
                    },
                    {
                        "type": "message",
                        "role": "user",
                        "content": {
                            "type": "input_text",
                            "text": `\n**User provided variables and values**\nVariable Name: answer, Variable Value: {{item.answer}},Variable Name: input, Variable Value: {{item.input}}\n\n**Instructions**\n[{\"type\":\"message\",\"content\":[{\"type\":\"input_text\",\"text\":\"${prompt.developer}\"}],\"role\":\"system\"},{\"type\":\"message\",\"content\":[{\"type\":\"input_text\",\"text\":\"${prompt.user}\"}],\"role\":\"user\"}]\n\n**Result**\n{{item.gemini_output}}\n`
                        }
                    }
                ],
                "pass_threshold": 5,
                "range": [
                    1,
                    7
                ],
                "sampling_params": null
            },
        ],
    });

    console.log("Created eval:", evalObj);
    console.log("Your eval ID is:", evalObj.id);
}

createEval().catch(console.error);
