# TODO

## Plan to add question image for every question
1. Update `TrueFalseQuestion.tsx` to accept `image?: string | null` and render `<img>` when provided.
2. Update `MultipleChoiceQuestion.tsx` to accept `image?: string | null` and render `<img>` when provided.
3. `EssayQuestion.tsx` already renders `image`; verify it matches expected layout.
4. Verify `QuestionCard.tsx` passes `image` correctly for all question types.
5. Run TypeScript check / build to ensure no TS/ESLint errors.

