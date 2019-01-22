const {SkillID,Vec3} = require('tera-data-parser').types;
const SettingsUI = require('tera-mod-ui').Settings;

module.exports = function Bosstester(mod) {

    if (mod.proxyAuthor !== 'caali' || !global.TeraProxy)
        mod.warn('You are trying to use this module on an unsupported version of tera-proxy. It may not work as expected, and even if it does now it may break at any point in the future.');

    let npccid = 2222222n,
        safespawn = true,
        spawning = false,
        id = 1111111,
        bossloc = {},
        huntid = 0,
        model = 0,
        loc = {},
        locw, bosslocw;

    mod.command.add('summontoggle', () => {
        if (ui) {
            ui.show();
        } else {
            mod.settings.enabled = !mod.settings.enabled;
            mod.command.message(`Boss Skill Tester is now ${mod.settings.enabled ? "enabled" : "disabled"}.`);
        }
    });

    mod.command.add('summon', (huntingZone, template, unk1) => {
        if (unk1 === undefined) unk1 = 0;
        spawnmob(Number.parseInt(huntingZone), Number.parseInt(template), Number.parseInt(unk1));
    });

    mod.command.add('summonskill', (skillid, stage, skillModel, type) => {
        if (stage === undefined) stage = 0;
        startskill(skillid, stage, skillModel ? skillModel : null, type ? type : 1);
    });

    mod.command.add('summonabn', (id, stack) => {
        if (stack === undefined) {
            stack = 1;
        }
        startabn(Number.parseInt(id), Number.parseInt(stack));
    });

    mod.command.add('summonquest', msg => {
        bossquest(msg);
    });

    mod.command.add('summonmodel', arg => {
        model = Number.parseInt(arg);
    });

    mod.command.add('summondespawn', () => {
        despawnmob();
    });

    mod.command.add('selfabn', (id, stack) => {
        if (stack === undefined) {
            stack = 1;
        }
        startselfabn(Number.parseInt(id), Number.parseInt(stack));
    });

    mod.hook('C_PLAYER_LOCATION', 5, (event) => {
        if (mod.settings.enabled) {
            locw = event.w;
            loc = event.loc;
        }
    });

    mod.hook('C_MEET_BOSS_INFO', 'raw', (event) => {
        if (spawning && safespawn) return false;
    });

    mod.hook('C_REQUEST_BOSS_GAGE_INFO', 'raw', () => {
        if (spawning && safespawn) return false;
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
            dest: {
                x: 0,
                y: 0,
                z: 0
            },
            target: mod.game.me.gameId,
            movement: []
        });
    }

    function despawnmob() {
        mod.send('S_DESPAWN_NPC', 3, {
            gameId: npccid,
            type: 1
        });
    }

    function spawnmob(huntingZoneId, templateId, unk1) {
        mod.send('S_SPAWN_NPC', 11, {
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
        Object.assign(bossloc, loc);
        bosslocw = locw;
        bossgage(npccid, huntingZoneId, templateId);
    }

    function startselfabn(id, stack) {
        mod.send('S_ABNORMALITY_BEGIN', 3, {
            target: mod.game.me.gameId,
            source: mod.game.me.gameId,
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

    let ui = null;
    if (global.TeraProxy.GUIMode) {
        ui = new SettingsUI(mod, require('./settings_structure'), mod.settings, { height: 123 }, { alwaysOnTop: true });
        ui.on('update', settings => { mod.settings = settings; });

        this.destructor = () => {
            if (ui) {
                ui.close();
                ui = null;
            }
        };
    }
};