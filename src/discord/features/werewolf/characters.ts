export const characters = {
	background: {
		sounds: {
			fantasy: "background_fantasy",
		},
	},
	everyone: {
		sounds: {
			close: "en_male_everyone_close",
			wake: "en_male_everyone_wake",
			timeisup: "en_male_everyone_timeisup_321vote",
		},
	},
	doppelganger: {
		description:
			"You will look at any other player's card and will become that role yourself, in addition to the player with that role.",
		image:
			"https://cf.geekdo-images.com/imagepage/img/rP3xvC-HFqIonPj5mmr6_1lJYJ8=/fit-in/900x600/filters:no_upscale()/pic4462582.png",

		sounds: {
			name: "en_male_doppelganger_name",
			rules: "en_male_doppelganger_rules",
			wake: "en_male_doppelganger_wake",
			close: "en_male_doppelganger_close",
			expert: {
				wake: "en_male_expert_doppelganger_wake",
			},
		},
	},
	werewolf: {
		description:
			"You will wake and look for the other werewolves. You will win if no werewolves are killed.",
		image:
			"https://cf.geekdo-images.com/imagepage/img/tgyrEJ3RbB_sZlme9eHu-ZKQ-vo=/fit-in/900x600/filters:no_upscale()/pic4462616.png",

		sounds: {
			name: "en_male_werewolf_name",
			rules: "en_male_werewolf_rules",
			wake: "en_male_werewolf_wake",
			close: "en_male_werewolf_close",
			expert: {
				wake: "en_male_expert_werewolf_wake",
			},
		},
	},
	minion: {
		description:
			"You will know who the werewolves are. You will win if no werewolves are killed, even if you are killed.",
		image:
			"https://cf.geekdo-images.com/imagepage/img/ePtQq2ZqGJ06HpM5I6CaYp3FixA=/fit-in/900x600/filters:no_upscale()/pic4462593.png",

		sounds: {
			name: "en_male_minion_name",
			rules: "en_male_minion_rules",
			wake: "en_male_minion_wake",
			thumb: "en_male_minion_thumb",
			close: "en_male_minion_close",
			doppelganger: "en_male_doppelganger_minion",
			expert: {
				wake: "en_male_expert_minion_wake",
				doppelganger: "en_male_expert_doppelganger_minion",
			},
		},
	},
	mason: {
		description: "You will wake and look for the other mason.",
		image:
			"https://cf.geekdo-images.com/imagepage/img/FeKsR8xD1jOgzFNx-V2Y-qIxT54=/fit-in/900x600/filters:no_upscale()/pic4462591.png",

		sounds: {
			name: "en_male_mason_name",
			rules: "en_male_mason_rules",
			wake: "en_male_mason_wake",
			close: "en_male_mason_close",
			expert: {
				wake: "en_male_expert_mason_wake",
			},
		},
	},
	seer: {
		description:
			"You will view either two of the center roles, or one role from any other player.",
		image:
			"https://cf.geekdo-images.com/imagepage/img/Y5Kj8KnsVPX9uJBn2mRw64WUzY4=/fit-in/900x600/filters:no_upscale()/pic4462604.png",

		sounds: {
			name: "en_male_seer_name",
			rules: "en_male_seer_rules",
			wake: "en_male_seer_wake",
			close: "en_male_seer_close",
			expert: {
				wake: "en_male_expert_seer_wake",
			},
		},
	},
	robber: {
		description:
			"You will exchange your role with another player's role, and will view your new role.",
		image:
			"https://cf.geekdo-images.com/imagepage/img/rv16CisR0fsy8pkEOAAZkGwTsFk=/fit-in/900x600/filters:no_upscale()/pic4462602.png",

		sounds: {
			name: "en_male_robber_name",
			rules: "en_male_robber_rules",
			wake: "en_male_robber_wake",
			close: "en_male_robber_close",
			expert: {
				wake: "en_male_expert_robber_wake",
			},
		},
	},
	troublemaker: {
		description: "You will exchange roles between any two other roles.",
		image:
			"https://cf.geekdo-images.com/imagepage/img/2gB7ClAu4p7rrs8ipGnNAfOOO-w=/fit-in/900x600/filters:no_upscale()/pic4462611.png",

		sounds: {
			name: "en_male_troublemaker_name",
			rules: "en_male_troublemaker_rules",
			wake: "en_male_troublemaker_wake",
			close: "en_male_troublemaker_close",
			expert: {
				wake: "en_male_expert_troublemaker_wake",
			},
		},
	},
	drunk: {
		description:
			"You will exchange your role with a role from the center, but you will not view your new role.",
		image:
			"https://cf.geekdo-images.com/imagepage/img/IC7i93WsW03tEbcXHmeV6OxEr_c=/fit-in/900x600/filters:no_upscale()/pic4462584.png",

		sounds: {
			name: "en_male_drunk_name",
			rules: "en_male_drunk_rules",
			wake: "en_male_drunk_wake",
			close: "en_male_drunk_close",
			expert: {
				wake: "en_male_expert_drunk_wake",
			},
		},
	},
	insomniac: {
		description: "You will view your own role.",
		image:
			"https://cf.geekdo-images.com/imagepage/img/RHfz10FGfiYxunbUsJt1_xNwrS4=/fit-in/900x600/filters:no_upscale()/pic4462588.png",

		sounds: {
			name: "en_male_insomniac_name",
			rules: "en_male_insomniac_rules",
			wake: "en_male_insomniac_wake",
			close: "en_male_insomniac_close",
			doppelganger: "en_male_doppelganger_insomniac",
			expert: {
				wake: "en_male_expert_insomniac_wake",
				doppelganger: "en_male_expert_doppelganger_insomniac",
			},
		},
	},
	villager: {
		description:
			"You will figure out who the bad guys are, and make sure one of them is killed.",
		image:
			"https://cf.geekdo-images.com/imagepage/img/PsaeiAGo4yVQQGhE-7995uZDCc8=/fit-in/900x600/filters:no_upscale()/pic4462615.png",

		sounds: {
			name: "en_male_villager_name",
			rules: "en_male_villager_rules",
		},
	},
	hunter: {
		description: "If you are killed, the player you voted for will also die.",
		image:
			"https://cf.geekdo-images.com/imagepage/img/TlZNLrMvaQhs7pLuu_7aW3vFpr4=/fit-in/900x600/filters:no_upscale()/pic4462587.png",

		sounds: {
			name: "en_male_hunter_name",
			rules: "en_male_hunter_rules",
		},
	},
	tanner: {
		description: "You will win and everyone else will lose if you are killed.",
		image:
			"https://cf.geekdo-images.com/imagepage/img/UkNvWkkev_3IZFRjRvslxYTmK34=/fit-in/900x600/filters:no_upscale()/pic4462480.png",

		sounds: {
			name: "en_male_tanner_name",
			rules: "en_male_tanner_rules",
		},
	},
};
