const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
var ObjectId = require("mongoose").Types.ObjectId;

const Project = require("../../models/Project");

// @route   GET api/projects
// @desc    get all projects
// @access  public
router.get("/", async (req, res) => {
    try {
        const projects = await Project.find().select("-about");
        res.json(projects);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server Error");
    }
});

// @route   POST api/projects/
// @desc    get projects of given ids
// @access  public
router.post(
    "/",
    [check("ids", "Given list is empty").notEmpty()],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const ids = req.body.ids.filter((id) => ObjectId.isValid(id));
            const projects = await Project.find()
                .select("-about")
                .where("_id")
                .in(ids)
                .exec();
            res.json(projects);
        } catch (error) {
            console.log(error.message);
            res.status(500).send("Server Error");
        }
    }
);

// @route   GET api/projects/:id
// @desc    get project by id
// @access  public
router.get("/:id", async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ msg: "Project not found" });
        }

        res.json(project);
    } catch (err) {
        console.log(err.message);
        if (err.kind === "ObjectId") {
            return res.status(404).json({ msg: "Project not found" });
        }
        res.status(500).send("Server Error");
    }
});

// @route   POST api/projects/new
// @desc    create new project
// @access  public
router.post(
    "/new",
    [
        check("title", "Title is required").notEmpty(),
        check("createdBy", "Creator name is required").notEmpty(),
        check(
            "reward",
            "Reward is required and should be a non negative number"
        ).notEmpty().isFloat({min:0}),
        check("shortDesc", "Short description required").notEmpty(),
        check("about", "About required").notEmpty(),
        check("about.description", "Description required").notEmpty(),
        check("about.checkpoints")
            .isArray()
            .withMessage("Checkpoints should be a array of strings")
            .notEmpty()
            .withMessage("Atleast one checkpoint required"),
        check("about.checkpoints.*", "Title cannot be empty").notEmpty(),
        check("about.contact", "Contact information required").notEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        try {
            const { title, createdBy, reward, shortDesc, about } = req.body;
            
            const project = new Project({
                title,
                createdBy,
                reward,
                shortDesc,
                about,
            });
            
            await project.save();
            res.json(project);
        } catch (error) {
            console.log(error.message);
            res.status(500).send("Server Error");
        }
    }
);

module.exports = router;
