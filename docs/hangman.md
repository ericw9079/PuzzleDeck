---
title: Hangman
---
# Hangman
Twitch chat adaptation of the popular game, hangman where players need to work together to guess the word before you run out of lives. Words can very in length between 2 and 15 letters long and are valid scrabble words. The length of the word players are trying to guess will be clearly communicated through the use of underscores (_). Similar to the normal hangman players start with a collective 9 lives, due to the limitations of a text-only platform they are represented using ❤️ in place of the traditional diagram often drawn (one ❤️ for each part of the diagram).  
Similarly to the traditional hangman, there is no penalty for guessing a letter that has already been guessed, however, there is a penalty for guessing a previously guessed word.  

Lives can be lost for any of the following:
* Guessing a letter not in the word
* Incorrectly attempting to guess the entire word

The game will end under one of the following condition:
* The last life was lost
* The word was successfully guessed
* There are no more unknown letters
* The game was forcibly ended with !endpuzzle
In all cases, the correct word is revealed if it wasn't already

There's **no reward** for being the one to guess the word, other than having your name show up in chat. Due to platform limitations, guesses may or may not be processed in the order the appear in chat.

## How To Play
You can either guess a letter or try for the entire word.  
To guess a letter: enter `!guess` followed by a single letter you'd like to guess.  
To make an attempt on the entire word, enter `!guess` followed by a word exactly as long as the word you're attempting to guess.  
To view get a list of already guessed letters, enter `!guessed`