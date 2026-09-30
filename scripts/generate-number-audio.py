"""Build time: python -m pip install edge-tts; node scripts/prepare-number-audio.mjs.
Sends only generic number words, never child data. The game uses local MP3 files.
"""
import asyncio, json, pathlib
import edge_tts
ROOT = pathlib.Path(__file__).resolve().parent.parent
VOICE = 'fr-CH-ArianeNeural'
async def main():
    clips=json.loads((ROOT/'scripts/number-audio-plan.json').read_text(encoding='utf-8'))
    gate=asyncio.Semaphore(5)
    done=0
    async def generate(clip):
        nonlocal done
        path=ROOT/clip['file']
        path.parent.mkdir(parents=True,exist_ok=True)
        async with gate:
            if not path.exists() or path.stat().st_size<1000:
                for attempt in range(3):
                    try:
                        await asyncio.wait_for(edge_tts.Communicate(clip['text']+'.',VOICE,rate='-15%').save(str(path)),timeout=45)
                        if path.stat().st_size<1000: raise ValueError('Empty recording')
                        break
                    except Exception:
                        if attempt==2: raise
                        await asyncio.sleep(2)
            done+=1
            if done%20==0: print(f'{done}/{len(clips)} recordings',flush=True)
    await asyncio.gather(*(generate(clip) for clip in clips))
    print(f'Complete: {len(clips)} recordings ({VOICE}).',flush=True)
asyncio.run(main())
