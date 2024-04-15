---
title: Commands
order: 2
---
# Commands
There are 4 types of commands in PuzzleDeck.
1. Management Commands
2. Information Commands
3. Mod Only Commands
4. Puzzle Commands
Arguments wrapped in <> are required while arguments wrapped in [] are optional.

## Management Commands
These commands can be used to manage the bot. They are used to control which puzzle is active and it's state (running/not running).  
They are available to anyone with a cool-down, and always available to mods and the broadcasters.

### Load Puzzle
```
!puzzle <puzzle>
```
Allows for the loading of a specific puzzle. When a puzzle is loaded it becomes the "active" puzzle and becomes the target of the other commands.
* Only one puzzle can be "active" at a time. Attempting to load another puzzle will switch to that puzzle instead
* The provided puzzle must be one of the available puzzles.
* Attempting to load the currently active puzzle will effectively reset it

### Unload Puzzle
```
!puzzle null
```
Attempting to load the special "null" puzzle will unload the currently active puzzle and effectively result in no puzzle being loaded.  
PuzzleDeck will respond with "No Puzzle Loaded" in response to other management commands, and all puzzle commands will be disabled
* Due to a mix of NodeJS limitations and implementation details, it is not technically possible to fully unload a puzzle.

### Start Puzzle
```
!startpuzzle
Alias: !puzzlestart
```
Starts the currently active puzzle if it's not currently running.  
Must end the puzzle before restarting.

### End Puzzle
```
!endpuzzle
Alias: !puzzleend
```
Ends the currently active puzzle if it's running.  
Must start the puzzle before it can be ended.
Puzzles might end on their own when they're completed.

## Information Commands
These commands provide information independent of the currently active puzzle.
They are always available to everyone.

### View Currently Loaded Puzzle
```
!puzzle
```
The !puzzle command can also be used to view the currently loaded puzzle by not providing a puzzle to load/switch to.

### List Available Puzzles
```
!puzzles
Aliases: !listpuzzles, !puzzlelist, !listpuzzle
```
Display the list of available puzzles that can be loaded.  
Puzzles will automatically be removed from this list if they fail to load, start, or end.

### How To Play
```
!howtoplay
Alias: !htp
```
Shows the how to play guide for the currently loaded puzzle.  
This command does nothing if there's no puzzle loaded.  
The "How to play guide" describes how to use the puzzle.

## Mod Only Commands
These commands provide mods and broadcasters more control over the bot.
Only available to mods and the broadcasters (with the respective badges)

### Restrict Management Commands
```
!lockout
```
Switch between allowing everyone to manage the bot (default), and only mods.  
Useful for preventing the bot from being abused, or assisting in locking down the bot if chat gets crazy.

### Toggle Auto Mode
```
!auto
```
Enable/Disable Auto Mode.  
Auto mode will automatically load and restart puzzles when finished.  
AKA. Afk Mode.  
Useful for using the bot during breaks during streams to give chat something to do.

### View Status
```
!status
```
Displays current bot status. Including:  
* Currently loaded puzzle
* Puzzle Status
* Auto mode Status
* Controls Status

## Puzzle Commands
Unlike the above commands, these commands are specific to the currently loaded puzzle.  
Consult the puzzles "How to play" guide, or it's doc page for details.  