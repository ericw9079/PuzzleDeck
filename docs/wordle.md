---
title: Wordle
---
# Wordle
Twitch chat adaptation of the popular word game Wordle. In order to accommodate the challenges of working in a multi-user text only interface, some adjustments had to be made.  
This version features the following changes:  
* No limit on the number of guesses, game will continue until it is either stopped or someone successfully guesses the word
* Everyone can see the guesses and the results. Chatters can work collaboratively, or race each other to be the first to guess the word
* Every response includes the related guess making it clear which guess resulted in what

Similar to the original wordle, there's **no reward** for being the first to guess the word, other than having your name show up in chat. Due to platform limitations, guesses may or may not be processed in the order the appear in chat.

## How To Play
Use `!guess` followed by a 5 letter word to make your guess. All guesses must consist of 5 letters.
The result will consist of the following:
* \* = The letter exists elsewhere in the word (Right letter, Wrong spot, equivalent to a yellow)
* _ = The letter does not exist in the word (equivalent to a grey)
* A-Z = The letter exists in that position in the word (Right letter, Right spot, equivalent to a green)