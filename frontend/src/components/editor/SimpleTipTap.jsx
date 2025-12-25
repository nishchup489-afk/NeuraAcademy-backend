import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import BlockQuote from "@tiptap/extension-blockquote";
import CodeBlock from "@tiptap/extension-code-block";
import Code from "@tiptap/extension-code";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import Underline from "@tiptap/extension-underline";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { useEffect, useState } from "react";
import "./tiptap.css";

const MenuBar = ({ editor }) => {
    const [isUploading, setIsUploading] = useState(false);

    if (!editor) return null;

    const handleImageUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "neuraacademy"); // or use your Cloudinary preset

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await response.json();
            if (data.secure_url) {
                editor.chain().focus().setImage({ src: data.secure_url }).run();
            }
        } catch (error) {
            console.error("Image upload failed:", error);
            alert("Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    const addLink = () => {
        const url = prompt("Enter the URL:");
        if (url) {
            editor
                .chain()
                .focus()
                .extendMarkRange("link")
                .setLink({ href: url })
                .run();
        }
    };

    return (
        <div className="border-b border-gray-300 bg-gray-100 p-3 rounded-t-lg flex flex-wrap gap-1">
            {/* Text Formatting */}
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`px-3 py-2 rounded text-sm font-semibold transition ${
                    editor.isActive("bold")
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-200"
                }`}
                title="Bold (Ctrl+B)"
            >
                <strong>B</strong>
            </button>

            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`px-3 py-2 rounded text-sm font-semibold transition ${
                    editor.isActive("italic")
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-200"
                }`}
                title="Italic (Ctrl+I)"
            >
                <em>I</em>
            </button>

            <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`px-3 py-2 rounded text-sm font-semibold transition ${
                    editor.isActive("underline")
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-200"
                }`}
                title="Underline (Ctrl+U)"
            >
                <u>U</u>
            </button>

            <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`px-3 py-2 rounded text-sm font-semibold transition ${
                    editor.isActive("strike")
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-200"
                }`}
                title="Strikethrough"
            >
                <s>S</s>
            </button>

            <div className="border-l border-gray-300 mx-1"></div>

            {/* Headings */}
            {[1, 2, 3].map((level) => (
                <button
                    key={level}
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level }).run()
                    }
                    className={`px-3 py-2 rounded text-sm font-semibold transition ${
                        editor.isActive("heading", { level })
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-200"
                    }`}
                    title={`Heading ${level}`}
                >
                    H{level}
                </button>
            ))}

            <div className="border-l border-gray-300 mx-1"></div>

            {/* Lists */}
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`px-3 py-2 rounded text-sm font-semibold transition ${
                    editor.isActive("bulletList")
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-200"
                }`}
                title="Bullet List"
            >
                • List
            </button>

            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`px-3 py-2 rounded text-sm font-semibold transition ${
                    editor.isActive("orderedList")
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-200"
                }`}
                title="Ordered List"
            >
                1. List
            </button>

            <div className="border-l border-gray-300 mx-1"></div>

            {/* Code & Quotes */}
            <button
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={`px-3 py-2 rounded text-sm font-semibold transition ${
                    editor.isActive("codeBlock")
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-200"
                }`}
                title="Code Block"
            >
                {"<>"}
            </button>

            <button
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={`px-3 py-2 rounded text-sm font-semibold transition ${
                    editor.isActive("code")
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-200"
                }`}
                title="Inline Code"
            >
                `code`
            </button>

            <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`px-3 py-2 rounded text-sm font-semibold transition ${
                    editor.isActive("blockquote")
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-200"
                }`}
                title="Blockquote"
            >
                ❝
            </button>

            <div className="border-l border-gray-300 mx-1"></div>

            {/* Links & Images */}
            <button
                onClick={addLink}
                className={`px-3 py-2 rounded text-sm font-semibold transition ${
                    editor.isActive("link")
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-200"
                }`}
                title="Insert Link"
            >
                🔗 Link
            </button>

            <label className="px-3 py-2 rounded text-sm font-semibold cursor-pointer bg-white text-gray-700 hover:bg-gray-200 transition flex items-center gap-1">
                {isUploading ? "Uploading..." : "🖼️ Image"}
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploading}
                />
            </label>

            <div className="border-l border-gray-300 mx-1"></div>

            {/* Horizontal Rule */}
            <button
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                className="px-3 py-2 rounded text-sm font-semibold bg-white text-gray-700 hover:bg-gray-200 transition"
                title="Horizontal Line"
            >
                —
            </button>

            {/* Clear Formatting */}
            <button
                onClick={() => editor.chain().focus().clearNodes().run()}
                className="px-3 py-2 rounded text-sm font-semibold bg-white text-gray-700 hover:bg-gray-200 transition"
                title="Clear Formatting"
            >
                ✕ Clear
            </button>

            {/* Undo & Redo */}
            <button
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="px-3 py-2 rounded text-sm font-semibold bg-white text-gray-700 hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Undo"
            >
                ↶
            </button>

            <button
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="px-3 py-2 rounded text-sm font-semibold bg-white text-gray-700 hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Redo"
            >
                ↷
            </button>
        </div>
    );
};

export default function SimpleTipTap({ value, onChange }) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: false,
                orderedList: false,
                listItem: false,
                heading: false,
                blockquote: false,
                codeBlock: false,
            }),
            Heading.configure({
                levels: [1, 2, 3],
            }),
            BulletList,
            OrderedList,
            ListItem,
            BlockQuote,
            CodeBlock.configure({
                languageClassPrefix: "language-",
            }),
            Code,
            Link.configure({
                openOnClick: false,
            }),
            Image.configure({
                allowBase64: true,
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            Underline,
            HorizontalRule,
        ],
        content: value,
        onUpdate({ editor }) {
            onChange(editor.getJSON());
        },
    });

    // Sync external updates
    useEffect(() => {
        if (editor && value) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    if (!editor) return null;

    return (
        <div className="tiptap-editor border border-gray-300 rounded-lg overflow-hidden bg-white">
            <MenuBar editor={editor} />
            <EditorContent
                editor={editor}
                className="prose prose-sm max-w-none p-4 min-h-[300px] focus:outline-none"
                style={{
                    fontSize: "16px",
                    lineHeight: "1.6",
                }}
            />
        </div>
    );
}
