## Tera proxy module for testing boss skills etc.

---

## Commands
- `/8 summonquest <message>`: Display S_Quest_Balloon message on boss. Use this for certain dungeon messages.
	- Use @Monster behavior id. Where id is the quest message id referenced in datacenter.

- `/8 summon <hunting zone> <template> <shape id>`: Summon boss with given hunting zone and template id.
	- Shape id is optional.

- `/8 summonskill <skill id> <stage> <skill model> <type>`: Let the boss make the given skill.
	- Id is event.skill.id. Stage, skill model and type are optional.

- `/8 selfabn <id> <stack>`: Apply abnormality on self.
	- Stack is optional.

- `/8 summonabn <id> <stack>`: Apply abnormality on boss.
	- Stack is optional.

- `/8 summontoggle`: Enable or disable the module.

- `/8 summondespawn`: Despawn the summoned boss.

- `/8 summonmodel`: Changes model parameter.
