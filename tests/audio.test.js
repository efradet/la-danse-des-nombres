import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {numberAudioPath} from '../src/listening.js';
test('every spoken number in all three dialects has a nonempty bundled MP3',()=>{
  for(const style of ['ch','ch80','fr'])for(let n=0;n<=100;n++){
    const path=numberAudioPath(n,style);
    const bytes=readFileSync(new URL(`../public${path}`,import.meta.url));
    assert.ok(bytes.length>1000,path);
    assert.ok(bytes.subarray(0,3).toString()==='ID3'||bytes[0]===0xff,path);
  }
});
