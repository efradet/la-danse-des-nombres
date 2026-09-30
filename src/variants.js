import { ARTWORKS } from './artworks.js';

const zone=(id,number,d,x,y)=>({id,number,d,x,y});
const oval=(id,n,x,y,rx,ry)=>zone(id,n,`M ${x-rx} ${y} a ${rx} ${ry} 0 1 0 ${2*rx} 0 a ${rx} ${ry} 0 1 0 ${-2*rx} 0`,x,y);
const flower=(id,x,y)=>zone(id,4,`M ${x} ${y-17} C ${x-30} ${y-48} ${x-53} ${y-5} ${x-23} ${y+9} C ${x-35} ${y+43} ${x+5} ${y+49} ${x+12} ${y+23} C ${x+49} ${y+37} ${x+55} ${y-8} ${x+27} ${y-10} C ${x+38} ${y-43} ${x+4} ${y-48} ${x} ${y-17} Z`,x-25,y-8);
const cloud=(id,x,y)=>zone(id,7,`M ${x-48} ${y+19} Q ${x-68} ${y-4} ${x-39} ${y-14} Q ${x-30} ${y-47} ${x} ${y-24} Q ${x+30} ${y-42} ${x+38} ${y-10} Q ${x+72} ${y+7} ${x+46} ${y+23} Z`,x,y);
const crystal=(id,x,y)=>zone(id,9,`M ${x-23} ${y+30} L ${x-29} ${y-9} L ${x} ${y-40} L ${x+26} ${y-8} L ${x+21} ${y+30} Z`,x,y);
// Published drawing IDs are immutable: treasures always resolve to their original geometry.
function variant(themeId,suffix,subtitle,{remove=[],replace={},back=[],front=[],details}={}){
  const base=ARTWORKS.find(a=>a.id===themeId);
  return {...base,id:`${themeId}-${suffix}`,themeId,subtitle,
    zones:[...back,...base.zones.filter(z=>!remove.includes(z.id)).map(z=>replace[z.id]||z),...front],
    details:details||base.details};
}
const variants=[
  variant('sirene','coraux','La lagune des coraux',{
    remove:['seaweed-left','seaweed-right','shell','fish','star-left','star-right','bubble'],
    front:[
      zone('coral-left',3,'M 98 454 L 98 390 L 72 377 L 65 349 L 80 342 L 88 365 L 98 368 L 98 337 L 116 337 L 116 397 L 133 381 L 138 357 L 153 362 L 149 391 L 116 423 L 116 454 Z',107,410),
      zone('coral-right',13,'M 479 455 L 479 396 L 455 382 L 451 355 L 467 353 L 470 373 L 479 376 L 479 338 L 496 338 L 496 391 L 514 373 L 516 351 L 532 354 L 530 384 L 496 419 L 496 455 Z',487,416),
      oval('pearl',15,147,136,30,30),cloud('sea-cloud',472,142),
      zone('shell-bed',17,'M 113 280 Q 86 236 109 218 Q 126 204 145 228 Q 163 204 179 220 Q 199 243 169 280 Z',145,252)],
  }),
  variant('sirene','tresor','La perle du coffre secret',{
    remove:['fish','shell','star-left','star-right','bubble','seaweed-left'],
    replace:{water:{...ARTWORKS[0].zones[0],x:205,y:424}},
    front:[
      zone('chest-lid',18,'M 63 404 L 63 377 Q 113 343 164 377 L 164 404 Z',112,383),
      zone('chest-box',14,'M 63 404 L 164 404 L 164 463 L 63 463 Z',92,435),
      zone('chest-lock',18,'M 121 407 L 147 407 L 147 440 L 121 440 Z',134,423),
      oval('treasure-pearl',15,473,147,34,34),crystal('sea-jewel',135,250),
      zone('shell-crown',17,'M 120 145 Q 86 96 111 84 Q 132 68 144 97 Q 157 62 175 81 Q 199 105 173 145 Z',147,119)],
  }),
  variant('licorne','ailes','La licorne aux grandes ailes',{
    remove:['star-left','star-right','star-low','moon'],
    front:[zone('wing',7,'M 330 299 Q 315 229 338 172 Q 351 203 359 224 Q 375 183 403 171 Q 398 215 379 247 Q 410 220 433 226 Q 411 281 360 308 Z',358,267),cloud('high-cloud',459,110),cloud('left-cloud',105,289)],
    details:['M 200 182 Q 207 191 215 181 M 145 222 l 1 0','M 339 284 Q 352 259 372 246'],
  }),
  variant('licorne','jardin','Le jardin de la licorne',{
    remove:['cloud-left','cloud-right','star-left','star-right','star-low','moon'],
    back:[zone('meadow',12,'M 45 435 Q 150 399 276 426 Q 411 395 555 438 L 555 484 L 45 484 Z',109,461)],
    front:[flower('flower-left',95,291),flower('flower-right',493,156),oval('flower-middle',18,95,291,13,13),oval('flower-heart',18,493,156,13,13),
      zone('butterfly-left',5,'M 356 109 C 314 56 291 117 352 137 L 356 109 Z',330,111),
      zone('butterfly-right',4,'M 356 109 C 398 56 421 117 360 137 L 356 109 Z',381,111)],
  }),
  variant('chateau','iles','Le château des îles',{
    remove:['hill','road','bush-left','bush-right','sun','cloud','sparkle'],
    back:[zone('sea',8,'M 45 401 Q 168 377 293 410 Q 416 379 555 405 L 555 481 L 45 481 Z',492,464),zone('island',12,'M 88 429 Q 298 349 516 429 L 504 449 L 91 449 Z',204,433)],
    replace:{'roof-center':zone('roof-center',9,'M 231 174 C 224 119 274 115 300 66 C 326 115 378 119 369 174 Z',300,135)},
    front:[zone('bridge',14,'M 278 427 L 322 427 L 370 483 L 230 483 Z',300,459),oval('sun-island',1,86,91,30,30),cloud('island-cloud',469,79)],
  }),
  variant('chateau','glace','Le palais de glace',{
    remove:['bush-left','bush-right','sun','cloud','sparkle'],
    replace:{hill:zone('hill',7,'M 48 433 Q 148 368 297 412 Q 438 368 552 431 L 552 474 L 48 474 Z',493,451),
      'roof-center':zone('roof-center',9,'M 231 174 L 262 155 L 267 113 L 288 115 L 300 66 L 317 117 L 341 123 L 339 154 L 369 174 Z',300,144),
      'roof-left':zone('roof-left',8,'M 104 232 L 127 213 L 140 174 L 163 141 L 192 185 L 202 213 L 223 232 Z',163,201),
      'roof-right':zone('roof-right',8,'M 377 232 L 403 210 L 409 181 L 437 141 L 464 181 L 472 210 L 496 232 Z',437,201)},
    front:[crystal('ice-left',77,375),crystal('ice-right',527,371),crystal('ice-star',90,97),cloud('snow-cloud',465,84)],
  }),
  variant('princesse','fleurs','La princesse des fleurs',{
    remove:['left-star','right-star','gem','moon','wand'],
    replace:{skirt:zone('skirt',9,'M 272 279 Q 300 298 329 280 Q 367 338 415 431 Q 387 460 360 443 Q 330 470 300 450 Q 270 470 240 443 Q 213 460 184 432 Q 234 339 272 279 Z',300,380)},
    front:[flower('garden-left',114,181),flower('garden-right',488,342),flower('flower-wand',439,200),oval('flower-center',18,439,200,13,13),oval('garden-pearl',17,117,337,25,32)],
    details:['M 270 165 Q 278 173 285 165 M 316 165 Q 323 173 330 165','M 292 190 Q 300 196 309 190','M 433 231 L 410 278','M 287 344 Q 300 323 313 344 Q 300 366 287 344 Z'],
  }),
  variant('princesse','lune','La princesse de la nuit',{
    remove:['left-star','right-star','gem','moon'],
    back:[zone('cape',16,'M 243 221 Q 300 191 363 221 L 448 449 Q 398 468 359 451 L 235 451 Q 183 468 152 447 Z',179,428)],
    replace:{skirt:zone('skirt',5,'M 272 279 Q 300 298 329 280 Q 366 337 415 431 Q 300 477 184 432 Q 234 339 272 279 Z',300,380)},
    front:[zone('night-moon',15,'M 480 63 A 43 43 0 1 0 505 127 A 38 38 0 0 1 480 63 Z',455,104),cloud('night-cloud',105,175),crystal('night-crystal',485,339)],
  }),
  variant('dragon','volcan','Le dragon du volcan',{
    remove:['cloud','star-right','star-left','gem'],
    back:[zone('volcano',14,'M 60 296 L 94 219 L 128 213 L 172 296 Z',115,269),zone('lava',13,'M 94 219 L 128 213 L 144 246 L 126 235 L 115 252 L 102 233 L 85 240 Z',113,228)],
    front:[cloud('smoke',113,117),oval('volcano-sun',13,475,93,32,32),crystal('red-rock',497,445)],
  }),
  variant('dragon','ciel','Le gardien des nuages',{
    remove:['ground','cloud','star-right','star-left','gem'],
    back:[cloud('cloud-floor-left',120,445),cloud('cloud-floor-right',469,449)],
    replace:{'wing-left':zone('wing-left',7,'M 276 276 Q 220 177 126 166 L 142 219 L 166 207 L 192 250 L 214 239 L 247 288 Z',186,205),
      'wing-right':zone('wing-right',7,'M 326 271 Q 388 178 461 168 L 444 220 L 420 208 L 396 251 L 375 241 L 353 296 Z',407,207)},
    front:[cloud('sky-cloud',116,102),zone('sky-moon',15,'M 472 53 A 39 39 0 1 0 499 117 A 35 35 0 0 1 472 53 Z',451,96),crystal('sky-gem',109,333)],
  }),
];
export const ALL_ARTWORKS=[...ARTWORKS,...variants];
export function pickArtwork(themeId,previousId=null,rng=Math.random){
  const choices=ALL_ARTWORKS.filter(art=>(art.themeId||art.id)===themeId&&art.id!==previousId);
  if(!choices.length)throw new Error(`Unknown drawing theme: ${themeId}`);
  return choices[Math.min(choices.length-1,Math.floor(rng()*choices.length))];
}
