const { SkillID } = require("tera-data-parser").types;
const Vec3 = require("tera-vec3");

module.exports = function BossSkillTester(mod) {
	const npcGameId = 2222222n;
	const npcLoc = {};

	let actionId = 0xFEFEFFEE;
	let playerLoc = {};
	let playerLocW = null;
	let npcHuntingZone = 0;
	let npcTemplateId = 0;
	let npcLocW = null;

	mod.command.add("summon", (huntingZone, templateId, unk1, unk2) => {
		if (unk1 === undefined) unk1 = 0;
		if (unk2 === undefined) unk2 = 0;
		despawnNpc();
		if (huntingZone && templateId)
			spawnNpc(Number.parseInt(huntingZone), Number.parseInt(templateId), Number.parseInt(unk1), Number.parseInt(unk2));
	});

	mod.command.add("summonskill", (skillId, stage, templateId, type) => {
		if (stage === undefined) stage = 0;
		if (skillId)
			startSkill(skillId, stage, templateId ? templateId : null, type ? type : 1);
	});

	mod.command.add("summonabn", (id, stack) => {
		if (stack === undefined) stack = 1;
		startAbn(Number.parseInt(id), Number.parseInt(stack));
	});

	mod.command.add("summonquest", (code, msg, type) => {
		questBalloon(code, msg, type);
	});

	mod.command.add("summonevent", (code, msg, type) => {
		dungeonEvent(code, msg, type);
	});

	mod.command.add("summonmodel", arg => {
		npcTemplateId = Number.parseInt(arg);
	});

	mod.command.add("summondespawn", () => {
		despawnNpc();
	});

	mod.command.add("selfabn", (id, stack) => {
		if (stack === undefined) stack = 1;
		startSelfAbn(Number.parseInt(id), Number.parseInt(stack));
	});

	mod.hook("S_LOAD_TOPO", "raw", () => {
		despawnNpc();
	});

	mod.hook("C_PLAYER_LOCATION", 5, event => {
		playerLocW = event.w;
		playerLoc = event.loc;
	});

	function startSkill(skillId, stage, templateId, type) {
		mod.send("S_ACTION_STAGE", 9, {
			"gameId": npcGameId,
			"loc": npcLoc,
			"w": npcLocW,
			"templateId": templateId ? templateId : npcTemplateId,
			"skill": new SkillID({
				"id": skillId,
				"huntingZoneId": npcHuntingZone,
				"type": type,
				"npc": true,
				"reserved": 0
			}),
			"stage": stage,
			"speed": 1,
			"projectileSpeed": 1,
			"id": actionId--,
			"effectScale": 1,
			"moving": false,
			"dest": new Vec3(0, 0, 0),
			"target": mod.game.me.gameId,
			"animSeq": []
		});
	}

	function despawnNpc() {
		mod.send("S_DESPAWN_NPC", 3, {
			"gameId": npcGameId,
			"type": 1
		});
	}

	function spawnNpc(huntingZoneId, templateId, unk1, unk2) {
		const loc = playerLoc;
		if (huntingZoneId === 3108 && (templateId === 1014 || templateId === 1015)) loc.z -= unk2;
		mod.send("S_SPAWN_NPC", mod.majorPatchVersion >= 101 ? 12 : 11, {
			"gameId": npcGameId,
			"target": 0,
			"loc": loc,
			"w": playerLocW,
			"relation": 12,
			"templateId": templateId,
			"huntingZoneId": huntingZoneId,
			"shapeId": unk1,
			"walkSpeed": 60,
			"runSpeed": 110,
			"status": 0,
			"mode": 0,
			"hpLevel": 5,
			"questInfo": 0,
			"visible": true,
			"villager": false,
			"spawnType": 1,
			"replaceId": 0,
			"spawnScript": 0,
			"replaceDespawnScript": 0,
			"aggressive": false,
			"owner": 0,
			"occupiedByPartyId": 0,
			"occupiedByPlayerId": 0,
			"bomb": false,
			"bySpawnEvent": false,
			"bgTeam": 0,
			"activeCylinder": 0,
			"repairable": false,
			"flightInteractionType": 0
		});
		npcTemplateId = templateId;
		npcHuntingZone = huntingZoneId;
		Object.assign(npcLoc, loc);
		npcLocW = playerLocW;
		bossGage(npcGameId, huntingZoneId, templateId);
	}

	function startSelfAbn(id, stack) {
		mod.send("S_ABNORMALITY_BEGIN", mod.majorPatchVersion >= 107 ? 5 : 4, {
			"target": mod.game.me.gameId,
			"source": mod.game.me.gameId,
			"id": id,
			"duration": 10000,
			"stacks": stack,
			"hitCylinderId": 0,
			"reason": 0,
			"values": []
		});
		mod.setTimeout(removeAbn, 10000, mod.game.me.gameId, id);
	}

	function startAbn(id, stack) {
		mod.send("S_ABNORMALITY_BEGIN", mod.majorPatchVersion >= 107 ? 5 : 4, {
			"target": npcGameId,
			"source": npcGameId,
			"id": id,
			"duration": 10000,
			"stacks": stack,
			"hitCylinderId": 0,
			"reason": 0,
			"values": []
		});
		mod.setTimeout(removeAbn, 10000, npcGameId, id);
	}

	function removeAbn(target, id) {
		mod.send("S_ABNORMALITY_END", 1, {
			"target": target,
			"id": id
		});
	}

	function questBalloon(code, msg, type) {
		if (code === "d") type = "@dungeon:";
		else if (code === "mb") type = "@monsterBehavior:";
		else return;
		mod.send("S_QUEST_BALLOON", 1, {
			"source": npcGameId,
			"message": type + msg
		});
	}

	function dungeonEvent(code, msg, type) {
		if (code === "d") type = "@dungeon:";
		else if (code === "mb") type = "@monsterBehavior:";
		else return;
		mod.send("S_DUNGEON_EVENT_MESSAGE", 2, {
			"type": 81,
			"chat": true,
			"channel": 0,
			"message": type + msg
		});
	}

	function bossGage(id, huntingZoneId, templateId) {
		mod.send("S_BOSS_GAGE_INFO", 3, {
			"id": id,
			"huntingZoneId": huntingZoneId,
			"templateId": templateId,
			"target": id,
			"unk1": 0,
			"unk2": 0,
			"curHp": 2000000,
			"maxHp": 2000000,
			"unk3": 1
		});
	}
};