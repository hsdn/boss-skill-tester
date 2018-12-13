const {SkillID, Vec3} = require('tera-data-parser').types;

let enabled = true,
	safespawn = true;

module.exports = function Bosssummon(mod) {

	let npccid = 2222222,
		spawning = false,
		id = 1111111,
		bossloc = {},
		huntid = 0,
	    model = 0,
		loc = {},
		bosslocw,
		locw,
		cid;
	
	mod.command.add('summontoggle', () => {
		enabled = !enabled;
		mod.command.message(enabled ? 'Boss Skill Tester Enabled' : 'Boss Skill Tester Disabled');
	});
	
	mod.command.add('summon', (huntingZone, template, unk1) => {
		if(unk1 === undefined) unk1 = 0;
		spawnNpc(Number.parseInt(huntingZone), Number.parseInt(template), Number.parseInt(unk1));
	});
	
	mod.command.add('summonskill', (skillid, stage, skillModel, type) => {
		if(stage === undefined) stage = 0;
		startskill(skillid, stage, skillModel ? skillModel : null, type ? type : 1);
	});
	
	mod.command.add('summonabn', (id, stack) => {
		if(stack === undefined) {
			stack = 1;
		}
		startabn(Number.parseInt(id), Number.parseInt(stack));
	});
	
	mod.command.add('summonquest', msg => {
		bossquest(msg);
	});
	
	mod.command.add('summoninfo', (arg1, arg2) => {
		bossinfo(Number.parseInt(arg1), Number.parseInt(arg2));
	});
	
	mod.command.add('summonmodel', arg => {
		model = Number.parseInt(arg);
	});
	
	mod.command.add('summondespawn',() => {
		despawnNpc();
	});
	
	mod.command.add('selfabn', (id, stack) => {
		if(stack === undefined) {
			stack = 1;
		}
		startselfabn(Number.parseInt(id), Number.parseInt(stack));
	});

	mod.hook('S_LOGIN', 10, event => {
		cid = event.gameId;
	});
	
	mod.hook('C_PLAYER_LOCATION', 5, event =>{
		if(enabled) {
			locw = event.w;
			loc = event.loc;
		}
	});
	
	mod.hook('C_MEET_BOSS_INFO', 'raw', event => {
		if(spawning && safespawn) return false;
	});
	
	mod.hook('C_REQUEST_BOSS_GAGE_INFO', 'raw', () => {
		if(spawning && safespawn) return false;
	});
	
	function startskill(skillid, stage, skillModel, type) {
		mod.send('S_ACTION_STAGE', 9, {
			gameId: npccid,
			loc: bossloc,
			w: bosslocw,
			templateId: skillModel ? skillModel : model,
			skill: new SkillID({
					id: skillid,
					huntingZoneId: huntid,
					type: type,
					npc: true,
					reserved: 0
				}),
			stage: stage,
			speed: 1,
			projectileSpeed: 1,
			id: id++,
			unk1: 1,
			unk2: 0,
			dest: {x:0,y:0,z:0},
			target: cid,
			movement: []
		});
		mod.log(skillid);
	}

	function despawnNpc(){
		mod.send('S_DESPAWN_NPC', 3, {
			gameId: npccid,
			type: 1
		});
	}

	function spawnNpc(huntingZoneId, templateId, unk1)	{ 
		mod.send('S_SPAWN_NPC', 10, {
			gameId: npccid,
			target: 0,
			loc: loc,
			w: locw,
			relation: 12,
			templateId: templateId,
			huntingZoneId: huntingZoneId,
			shapeId: unk1,
			walkSpeed: 60,
			runSpeed: 110,
			status: 0,
			mode: 0, 
			hpLevel: 5, 
			questInfo: 0,
			visible: true, 
			villager: false, 
			spawnType: 1,
			replaceId: 0, 
			spawnScript: 0,
			replaceDespawnScript: 0, 
			aggressive: false, 
			owner: 0,
			occupiedByPartyId: 0,
			occupiedByPlayerId: 0,
			bomb: false,
			bySpawnEvent: false,
			bgTeam: 0,
			activeCylinder: 0,
			repairable: false,
			flightInteractionType: 0		
		});
		model = templateId;
		huntid = huntingZoneId;
		spawning = true;
		Object.assign(bossloc,loc);
		bosslocw = locw;
		bossgage(npccid, huntingZoneId, templateId);
	}
	
	function startselfabn(id, stack) {
		mod.send('S_ABNORMALITY_BEGIN', 3, {
			target: cid,
			source: cid,
			id: id,
			duration: 10000,
			unk: 0,
			stacks: stack,
			unk2: 0
		});
	}
	
	function startabn(id, stack) {
		mod.send('S_ABNORMALITY_BEGIN', 3, {
			target: npccid,
			source: npccid,
			id: id,
			duration: 10000,
			unk: 0,
			stacks: stack,
			unk2: 0
		});
	}
	
	function bossquest(msg) {
		mod.send('S_QUEST_BALLOON', 1, {
			source: npccid,
			message: msg
		});
	}
		
	function bossgage(id, hz, temp) {
		mod.send('S_BOSS_GAGE_INFO', 3, {
			id: id,
			huntingZoneId: hz,
			templateId: temp,
			target: id,
			unk1: 0,
			unk2: 0,
			curHp: 2000000,
			maxHp: 2000000,
			unk3: 1
		});
	}
}