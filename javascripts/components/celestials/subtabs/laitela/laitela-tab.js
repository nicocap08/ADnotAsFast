"use strict";

Vue.component("laitela-tab", {
  data() {
    return {
      matter: new Decimal(0),
      maxMatter: new Decimal(0),
      matterExtraPurchasePercentage: 0
    };
  },
  methods: {
    update() {
      this.matter.copyFrom(player.celestials.laitela.matter);
      this.maxMatter.copyFrom(player.celestials.laitela.maxMatter);
      this.matterExtraPurchasePercentage = Laitela.matterExtraPurchaseFactor - 1;
    },
    maxAll() {
      Laitela.maxAllDMDimensions(4);
    },
    showLaitelaHowTo() {
      ui.view.h2pForcedTab = GameDatabase.h2p.tabs.filter(tab => tab.name === "Lai'tela")[0];
      Modal.h2p.show();
      ui.view.h2pActive = true;
    },
  },
  template: `
    <div class="l-laitela-celestial-tab">
      <div class="c-subtab-option-container">
        <primary-button
          class="o-primary-btn--subtab-option"
          @click="showLaitelaHowTo()"
        >Click for Lai'tela info</primary-button>
        <primary-button
          class="o-primary-btn--subtab-option"
          @click="maxAll"
        >Max all Dark Matter Dimensions</primary-button>
      </div>
      <div class="o-laitela-matter-amount">You have {{ format(matter.floor(), 2, 0) }} Dark Matter.</div>
      <div class="o-laitela-matter-amount">Your maximum Dark Matter ever is {{ format(maxMatter.floor(), 2, 0) }},
      giving {{ formatPercents(matterExtraPurchasePercentage, 2) }} more purchases from continuum.</div>
      <singularity-container />
      <div class="l-laitela-mechanics-container">
        <laitela-run-button />
        <div>
          <dark-matter-dimension-group />
          <annihilation-button />
        </div>
        <singularity-milestone-pane />
      </div>
    </div>`
});

Vue.component("singularity-container", {
  data() {
    return {
      darkEnergy: 0,
      darkEnergyGainPerSecond: 0,
      singularities: 0,
      singularityCapIncreases: 0,
      canPerformSingularity: false,
      singularityCap: 0,
      singularitiesGained: 0,
      autoSingularityDelay: 0,
      timeToAutoSingularity: 0,
      perStepFactor: 0,
    };
  },
  methods: {
    update() {
      const laitela = player.celestials.laitela;
      this.darkEnergy = laitela.darkEnergy;
      this.darkEnergyGainPerSecond = Array.range(1, 4)
        .map(n => MatterDimension(n))
        .filter(d => d.amount.gt(0))
        .map(d => d.powerDE * 1000 / d.interval)
        .sum();
      this.singularities = laitela.singularities;
      this.singularityCapIncreases = laitela.singularityCapIncreases;
      this.canPerformSingularity = Singularity.capIsReached;
      this.singularityCap = Singularity.cap;
      this.singularitiesGained = Singularity.singularitiesGained;
      this.autoSingularityDelay = SingularityMilestone.autoCondense.effectValue;
      this.timeToAutoSingularity = this.autoSingularityDelay - laitela.secondsSinceReachedSingularity;
      this.perStepFactor = Singularity.gainPerCapIncrease;
    },
    doSingularity() {
      Singularity.perform();
    },
    increaseCap() {
      Singularity.increaseCap();
    },
    decreaseCap() {
      Singularity.decreaseCap();
    },
  },
  computed: {
    singularityFormText() {
      const formText = this.singularitiesGained === 1 ? "condense all Dark Energy into a Singularity"
        : `condense all Dark Energy into ${format(this.singularitiesGained, 2, 0)} Singularities`;
      if (this.canPerformSingularity) {
        // Capitalize the string
        return `${formText.charAt(0).toUpperCase()}${formText.slice(1)}`;
      }
      return `Reach ${format(this.singularityCap)} Dark Energy to ${formText}`;
    },
    singularityWaitText() {
      const singularityTime = TimeSpan
        .fromSeconds((this.singularityCap - this.darkEnergy) / this.darkEnergyGainPerSecond)
        .toStringShort(false);
      if (this.canPerformSingularity) {
        return Number.isFinite(this.timeToAutoSingularity)
          ? `(Auto-condensing in ${TimeSpan.fromSeconds(this.timeToAutoSingularity).toStringShort(false)})`
          : "";
      }
      return `(Enough Dark Energy in ${singularityTime})`;

    },
    fullSingularityTime() {
      return TimeSpan.fromSeconds(this.singularityCap / this.darkEnergyGainPerSecond).toStringShort(false);
    },
    delayTime() {
      return TimeSpan.fromSeconds(this.autoSingularityDelay).toStringShort(false);
    },
    singularityRate() {
      const totalTime = this.singularityCap / this.darkEnergyGainPerSecond + this.autoSingularityDelay;
      const singularitiesPerSecond = this.singularitiesGained / totalTime;
      if (singularitiesPerSecond < 1 / 60) return `${format(3600 * singularitiesPerSecond, 2, 3)} per hour`;
      if (singularitiesPerSecond < 1) return `${format(60 * singularitiesPerSecond, 2, 3)} per minute`;
      return `${format(singularitiesPerSecond, 2, 3)} per second`;
    }
  },
  template: `
    <div class="l-laitela-singularity-container">
      <div class="l-laitela-singularity-container--left">
        <h2>
          You have {{ format(singularities, 2, 0) }} {{ "Singularity" | pluralize(singularities, "Singularities")}}
        </h2>
        <button
          class="c-laitela-singularity"
          :class="{ 'c-laitela-singularity--active' : canPerformSingularity }"
          @click="doSingularity">
          <h2>{{ singularityFormText }}</h2>
          <br>
          <h2>{{ singularityWaitText }}</h2>
        </button>
      </div>
      <div class="l-laitela-singularity-container--right">
        <div class="o-laitela-matter-amount">
          You have {{ format(darkEnergy, 2, 4) }} Dark Energy. (+{{ format(darkEnergyGainPerSecond, 2, 4) }}/s)
        </div>
        <button class="c-laitela-singularity__cap-control" @click="decreaseCap">
          Decrease Singularity cap.
        </button>
        <button class="c-laitela-singularity__cap-control" @click="increaseCap">
          Increase Singularity cap.
        </button>
        <br>
        Each step increases the required Dark Energy by {{ formatX(10) }}
        <br>
        but also increases gained Singularities by {{ formatX(perStepFactor) }}.
        <br>
        <br>
        Total time to <span v-if="Number.isFinite(autoSingularityDelay)">(auto-)</span>condense:
        {{ fullSingularityTime }}
        <span v-if="Number.isFinite(autoSingularityDelay) && autoSingularityDelay !== 0">
          (+{{ formatInt(autoSingularityDelay) }} seconds)
        </span>
        <br>
        Singularity gain rate: {{ singularityRate }}
      </div>
    </div>`
});

Vue.component("laitela-run-button", {
  data() {
    return {
      realityTime: 0,
      maxDimTier: 0,
      isRunning: false,
      realityReward: 1,
    };
  },
  methods: {
    update() {
      this.realityTime = player.celestials.laitela.fastestCompletion;
      this.maxDimTier = Laitela.maxAllowedDimension;
      this.realityReward = Laitela.realityReward;
      this.isRunning = Laitela.isRunning;
    },
    startRun() {
      if (!resetReality()) return;
      Laitela.initializeRun();
    },
    runButtonClassObject() {
      return {
        "o-laitela-run-button__icon": true,
        "o-laitela-run-button__icon--running": this.isRunning,
      };
    },
  },
  computed: {
    completionTime() {
      return TimeSpan.fromSeconds(this.realityTime).toStringShort();
    }
  },
  template: `
    <button class="o-laitela-run-button" @click="startRun">
      <b>Start Lai'tela's Reality</b>
      <div v-bind:class="runButtonClassObject()"></div>
      <div v-if="realityReward > 1">
        <b>All DM multipliers are {{ formatX(realityReward, 2, 2) }} higher</b>
        <br>
        <br>
        Fastest Completion: {{ completionTime }}
        <br>
        <br>
        <span v-if="maxDimTier <= 7">
          Highest active dimension: {{ formatInt(maxDimTier) }}
        </span>
        <br>
        <br>
      </div>
      IP and EP gain are dilated. Game speed is reduced to 1 and gradually comes back over 10 minutes,
      Black Hole discharging and pulsing are disabled.
      <br>
      <br>
      Antimatter generates entropy inside of this Reality. At 100% entropy, the Reality becomes destabilized and
      you gain a reward based on how quickly you reached 100%. If you can destabilize in less than 30 seconds,
      the Reality becomes more difficult but also gives a stronger reward.
    </button>`
});

Vue.component("dark-matter-dimension-group", {
  data() {
    return {
      activeDimensions: [],
      nextDimensionThreshold: 0,
    };
  },
  methods: {
    update() {
      this.activeDimensions = Array.range(0, 4).filter(i => MatterDimension(i + 1).amount.neq(0));
      this.nextDimensionThreshold = Array.range(0, 4)
        .filter(i => MatterDimension(i + 1).amount.eq(0))
        .map(i => MatterDimension(i + 1).adjustedStartingCost)
        .min();
    },
  },
  computed: {
    dimensions: () => MatterDimensionState.list,
  },
  template: `
    <span>
      <matter-dimension-row
        v-for="i in activeDimensions"
        :key="i"
        :dimension="dimensions[i]"
        />
      <div v-if="nextDimensionThreshold !== 0">
        <b>Next dimension unlocks at {{ format(nextDimensionThreshold) }} Dark Matter.</b>
        <br><br>
      </div>
    </span>`
});

Vue.component("annihilation-button", {
  data() {
    return {
      matter: new Decimal(0),
      darkMatterMult: 0,
      darkMatterMultGain: 0,
      hasAnnihilated: false,
      showAnnihilation: false,
      darkMatterMultRatio: 0,
      autoAnnihilationInput: player.celestials.laitela.autoAnnihilationSetting
    };
  },
  methods: {
    update() {
      this.matter.copyFrom(player.celestials.laitela.matter);
      this.darkMatterMult = Laitela.darkMatterMult;
      this.darkMatterMultGain = Laitela.darkMatterMultGain;
      this.hasAnnihilated = Laitela.darkMatterMult > 1;
      this.showAnnihilation = this.hasAnnihilated || !MatterDimensionState.list.some(d => d.amount.eq(0));
      this.darkMatterMultRatio = Laitela.darkMatterMultRatio;
    },
    annihilate() {
      Laitela.annihilate();
    },
    handleAutoAnnihilationInputChange() {
      const float = parseFloat(this.autoAnnihilationInput);
      if (isNaN(float)) {
        this.autoAnnihilationInput = player.celestials.laitela.autoAnnihilationSetting;
      } else {
        player.celestials.laitela.autoAnnihilationSetting = float;
      }
    }
  },
  template: `
    <button class="c-laitela-annihilation-button" 
      @click="annihilate()" 
      :style="{ visibility: showAnnihilation ? 'visible' : 'hidden' }">
      <h2>Annihilation</h2>
      <span v-if="hasAnnihilated">
        Current multiplier to all DM multipliers: <b>{{ formatX(darkMatterMult, 2, 2) }}</b>
        <br><br>
      </span>
      Resets your Dark Matter, Dark Matter Dimensions, and Dark Energy, 
      <span v-if="hasAnnihilated && matter.gte(1e20)">
        but adds <b>{{ format(darkMatterMultGain, 2, 2) }}</b> to your Annihilation multiplier.
        (<b>{{ formatX(darkMatterMultRatio, 2, 2) }}</b> from previous multiplier)
      </span>
      <span v-else-if="hasAnnihilated">
        adding to your current Annihilation multiplier (requires {{ format(1e20, 0, 0) }} Dark Matter).
      </span>
      <span v-else-if="matter.gte(1e20)">
        multiplying DM multipliers by <b>{{ formatX(1 + darkMatterMultGain, 2, 2) }}</b>.
      </span>
      <span v-else>
        giving a multiplier to all DM multipliers (requires {{ format(1e20, 0, 0) }} Dark Matter).
      </span>
      <div :style="{ visibility: hasAnnihilated ? 'visible' : 'hidden' }">
        <br>
        Auto-Annihilate when adding 
        <input type="text"
          v-model="autoAnnihilationInput"
          @change="handleAutoAnnihilationInputChange()"
          style="width: 6rem;"/>
        to the multiplier.
      </div>
    </button>`
});

Vue.component("singularity-milestone-pane", {
  data() {
    return {
      milestones: [],
    };
  },
  methods: {
    update() {
      this.milestones = SingularityMilestones.nextMilestoneGroup;
    },
  },
  template: `
    <div class="c-laitela-next-milestones">
      <div class="o-laitela-singularity-modal-button" onclick="Modal.singularityMilestones.show()">
        Show all milestones
      </div>
      <singularity-milestone v-for="milestone in milestones" :key="milestone.id" :milestone="milestone"/>
    </div>`
});
