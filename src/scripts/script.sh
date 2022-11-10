ffmpeg -y -i ../scripts/fullintro.mp4 -c:v copy -c:a copy ../scripts/clips/fullintro.ts

cd ../downloads

ffmpeg -y -i clip2.mp4 -c:v copy -c:a copy ../scripts/clips/clip2.ts

cd ../scripts

ffmpeg -y -i ./outro.mp4 -c:v copy -c:a copy ./clips/outro.ts

wait

ffmpeg -y -f concat -safe 0 -i mylist.txt -c:a copy -c:v copy ./clips/all.ts

wait

ffmpeg -y -i ./clips/all.ts -c:a aac -ar 48000 -c:v copy ./clips/output.mp4