# vrchat-avatar-watch-real-time
All the needed information to have a fully working watch on your avatar, showing real time\
Thanks to Neitri for parts of the shader

### DISCLAIMER: This tutorial is for advanced users which already know how to use Blender and how avatars work in Unity, I won't do any support on this. Please only open issues for missing, unclear or wrong information in the tutorial, you can also open pull requests if you feel to change / improve something in the tutorial

* Difficulty: 4/5 (Advanced users / Very advanced users)
* Time: About 4 hours

## Step 1: Prepare the 3d model
The first step is to find a watch 3d model and to put it on your avatar with the right digits polygons for the shader to work.
The provided Garmin.blend file contains an example. I recommend you copy those to any model you want because the UV map and vertex colors are already set properly.\
Your watch should end up with one (or more) material for the watch itself and one material with the digits polygons only, just like in the example.

![Vertex color scheme](https://i.ibb.co/BwgD3N3/tmp.png)

Note: you can discard whatever digit polygon you want, the shader will still work

## Step 2: Import the shader
Once you have your 3d model with the hours / minutes / seconds etc. polygons, copy `Watch.shader` and `WatchNumbers.png` to your Unity project and create a new material that uses that shader. Set `_MainTex` to `WatchNumbers.png` and set the color and brightness that you want. Then put it on the digits polygons material of the watch.

## Step 3: Create the animations and animations layers
You will need two animations. One for the hours and one for the minutes.\
Both animations will be almost same, you need two key frames. One at 0:00 with `Skinned Mesh Renderer.Material_Real Time Hours` at `0` and one at `0:10` with `Skinned Mesh Renderer.Material_Real Time Hours` at `1`\
The second animation is exactly the same but with `Skinned Mesh Renderer.Material_Real Time Minutes` instead of hours.

**Very important**: Select both key frame, right click and click on `Both Tangents` -> `Linear`

Here is how the animation should look in the Curves section of Unity
![Unity Curves view of the animation](https://i.ibb.co/HHWcZwz/Screenshot-2022-12-12-213151.png)

## Step 4: Add the parameters to your avatar
Simply add the two parameters to your avatar Parameters
![Parameters menu](https://i.ibb.co/5LB7CWW/Screenshot-2022-12-12-213550.png)

## Step 5: Add the animations in the controller
Both animations need to be added in the `FX Controller`\
Simply follow exactly what's on the photo and repeat the exact same step for the minutes but by using the minutes animation and variable instead. Don't forget to add both parameters in the `parameters` section of the animation controller and set the weight of both animations layer to 1.

![FX Animation controller](https://i.ibb.co/YcQCxQT/Screenshot-2022-12-12-213940.png)

## Step 6: Run the node.js OSC program
Upload and test your avatar in VRChat, the watch seconds should go through but not the minutes and hours, this is normal. Your watch is not receiving OSC data yet.\
First step, install the latest Node.js from the official website https://nodejs.org/en/download/
Then, go to the `OSC program` folder and open a command line there. Type in `npm install` and wait for it to finish.
Once npm install has finished, type `node index.js` in the command line to run the program.\

Note: You will need to run the program every time you run VRChat or you will need to run it on a server. I run mine on a server I have at home and I use the argument `--osc=9000:192.168.1.22:9001` in order to tell VRChat to send OSC data to my server

## Step 7: Reset and enable OSC on your avatar
**Important**: first go to `C:\Users\???\AppData\LocalLow\VRChat\VRChat\OSC\usr_???\Avatars` and delete the `avtr_???.json`` corresponding to your avatar. This is the previous OSC config of your avatar\
I think using the `Reset OSC` button in the game does the same, I'm not sure though.

Your avatar minutes and hours may not update yet, the last thing to do is to go the menu on your hand and enable OSC in the options. As soon as OSC is enabled, the Node.js program should react and send the data to your avatar

Enjoy!
